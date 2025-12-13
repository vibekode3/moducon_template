import { json } from '@sveltejs/kit';
import { saveMessage, getMessages } from '$lib/db/messages.js';
import { getSession, updateSessionTitle } from '$lib/db/sessions.js';

/**
 * GET /api/sessions/[id]/messages
 * 세션의 메시지 목록 조회
 */
export async function GET({ params }) {
	try {
		// 세션 존재 확인
		const session = await getSession(params.id);
		if (!session) {
			return json({ 
				error: '세션을 찾을 수 없습니다.' 
			}, { status: 404 });
		}
		
		const messages = await getMessages(params.id);
		
		return json({ 
			session_id: params.id,
			session_title: session.title,
			messages 
		});
	} catch (error) {
		console.error('❌ 메시지 조회 오류:', error);
		return json({ 
			error: '메시지를 불러오는데 실패했습니다.',
			details: error.message 
		}, { status: 500 });
	}
}

/**
 * POST /api/sessions/[id]/messages
 * 메시지 저장
 */
export async function POST({ params, request }) {
	try {
		const body = await request.json();
		const { speaker, message, timestamp } = body;
		
		// 필수 필드 검증
		if (!speaker || !message) {
			return json({ 
				error: 'speaker와 message는 필수입니다.' 
			}, { status: 400 });
		}
		
		// speaker 유효성 검증
		const validSpeakers = ['나', 'AI 선생님', '시스템'];
		if (!validSpeakers.includes(speaker)) {
			return json({ 
				error: `speaker는 다음 중 하나여야 합니다: ${validSpeakers.join(', ')}` 
			}, { status: 400 });
		}
		
		// 세션 존재 확인
		const session = await getSession(params.id);
		if (!session) {
			return json({ 
				error: '세션을 찾을 수 없습니다.' 
			}, { status: 404 });
		}
		
		// 메시지 저장
		const messageTimestamp = timestamp ? new Date(timestamp) : new Date();
		const savedMessage = await saveMessage(params.id, speaker, message, messageTimestamp);
		
		// 첫 번째 사용자 메시지인 경우 세션 제목 업데이트
		if (speaker === '나' && !session.title) {
			await updateSessionTitle(params.id, message);
			console.log('📝 세션 제목 자동 생성:', message.substring(0, 50));
		}
		
		console.log('💾 메시지 저장:', { sessionId: params.id, speaker, messageId: savedMessage.id });
		
		return json({ 
			message_id: savedMessage.id,
			saved: true
		}, { status: 201 });
	} catch (error) {
		console.error('❌ 메시지 저장 오류:', error);
		return json({ 
			error: '메시지 저장에 실패했습니다.',
			details: error.message 
		}, { status: 500 });
	}
}

