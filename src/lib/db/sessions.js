import { query } from './client.js';

/**
 * 세션 관련 데이터베이스 쿼리 함수들
 */

/**
 * 새 채팅 세션 생성
 * @returns {Promise<{id: string, created_at: Date}>} 생성된 세션 정보
 */
export async function createSession() {
	const result = await query(
		`INSERT INTO chat_sessions (title) 
		 VALUES (NULL) 
		 RETURNING id, created_at`
	);
	return result.rows[0];
}

/**
 * 세션 제목 업데이트 (첫 번째 사용자 메시지 기반)
 * @param {string} sessionId - 세션 ID
 * @param {string} firstMessage - 첫 번째 사용자 메시지
 * @returns {Promise<void>}
 */
export async function updateSessionTitle(sessionId, firstMessage) {
	// 제목은 최대 50자, 초과 시 "..." 추가
	const title = firstMessage.length > 50 
		? firstMessage.substring(0, 50) + '...' 
		: firstMessage;
	
	await query(
		`UPDATE chat_sessions 
		 SET title = $1, first_user_message = $2 
		 WHERE id = $3`,
		[title, firstMessage, sessionId]
	);
}

/**
 * 세션 목록 조회 (최신순)
 * @param {number} limit - 조회할 개수 (기본 20)
 * @param {number} offset - 오프셋 (기본 0)
 * @returns {Promise<Array>} 세션 목록
 */
export async function getSessions(limit = 20, offset = 0) {
	const result = await query(
		`SELECT 
			s.id,
			s.title,
			s.created_at,
			s.updated_at,
			COUNT(m.id)::int as message_count
		 FROM chat_sessions s
		 LEFT JOIN chat_messages m ON s.id = m.session_id
		 GROUP BY s.id
		 ORDER BY s.created_at DESC
		 LIMIT $1 OFFSET $2`,
		[limit, offset]
	);
	return result.rows;
}

/**
 * 특정 세션 조회
 * @param {string} sessionId - 세션 ID
 * @returns {Promise<Object|null>} 세션 정보
 */
export async function getSession(sessionId) {
	const result = await query(
		`SELECT 
			s.id,
			s.title,
			s.first_user_message,
			s.created_at,
			s.updated_at,
			COUNT(m.id)::int as message_count
		 FROM chat_sessions s
		 LEFT JOIN chat_messages m ON s.id = m.session_id
		 WHERE s.id = $1
		 GROUP BY s.id`,
		[sessionId]
	);
	return result.rows[0] || null;
}

/**
 * 세션 삭제
 * @param {string} sessionId - 세션 ID
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
export async function deleteSession(sessionId) {
	const result = await query(
		`DELETE FROM chat_sessions WHERE id = $1`,
		[sessionId]
	);
	return result.rowCount > 0;
}

/**
 * 날짜별 세션 통계
 * @param {number} days - 최근 며칠간의 통계 (기본 7일)
 * @returns {Promise<Array>} 날짜별 통계
 */
export async function getSessionStats(days = 7) {
	const result = await query(
		`SELECT 
			DATE(created_at) as date,
			COUNT(*)::int as session_count
		 FROM chat_sessions
		 WHERE created_at >= NOW() - INTERVAL '${days} days'
		 GROUP BY DATE(created_at)
		 ORDER BY date DESC`
	);
	return result.rows;
}

export default {
	createSession,
	updateSessionTitle,
	getSessions,
	getSession,
	deleteSession,
	getSessionStats
};

