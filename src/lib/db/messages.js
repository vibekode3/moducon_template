import { query } from './client.js';

/**
 * 메시지 관련 데이터베이스 쿼리 함수들
 */

/**
 * 메시지 저장
 * @param {string} sessionId - 세션 ID
 * @param {string} speaker - 발화자 ('나', 'AI 선생님', '시스템')
 * @param {string} message - 메시지 내용
 * @param {Date} timestamp - 메시지 발생 시간
 * @returns {Promise<{id: string}>} 생성된 메시지 ID
 */
export async function saveMessage(sessionId, speaker, message, timestamp = new Date()) {
	const result = await query(
		`INSERT INTO chat_messages (session_id, speaker, message, timestamp)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id`,
		[sessionId, speaker, message, timestamp]
	);
	return result.rows[0];
}

/**
 * 세션의 메시지 목록 조회 (시간순)
 * @param {string} sessionId - 세션 ID
 * @returns {Promise<Array>} 메시지 목록
 */
export async function getMessages(sessionId) {
	const result = await query(
		`SELECT 
			id,
			speaker,
			message,
			timestamp,
			created_at
		 FROM chat_messages
		 WHERE session_id = $1
		 ORDER BY timestamp ASC`,
		[sessionId]
	);
	return result.rows;
}

/**
 * 세션의 첫 번째 사용자 메시지 조회
 * @param {string} sessionId - 세션 ID
 * @returns {Promise<Object|null>} 첫 번째 사용자 메시지
 */
export async function getFirstUserMessage(sessionId) {
	const result = await query(
		`SELECT message
		 FROM chat_messages
		 WHERE session_id = $1 AND speaker = '나'
		 ORDER BY timestamp ASC
		 LIMIT 1`,
		[sessionId]
	);
	return result.rows[0] || null;
}

/**
 * 메시지 삭제
 * @param {string} messageId - 메시지 ID
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
export async function deleteMessage(messageId) {
	const result = await query(
		`DELETE FROM chat_messages WHERE id = $1`,
		[messageId]
	);
	return result.rowCount > 0;
}

/**
 * 세션의 메시지 개수 조회
 * @param {string} sessionId - 세션 ID
 * @returns {Promise<number>} 메시지 개수
 */
export async function getMessageCount(sessionId) {
	const result = await query(
		`SELECT COUNT(*)::int as count
		 FROM chat_messages
		 WHERE session_id = $1`,
		[sessionId]
	);
	return result.rows[0].count;
}

export default {
	saveMessage,
	getMessages,
	getFirstUserMessage,
	deleteMessage,
	getMessageCount
};

