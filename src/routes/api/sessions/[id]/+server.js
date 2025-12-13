import { json } from '@sveltejs/kit';
import { getSession, deleteSession, updateSessionTitle } from '$lib/db/sessions.js';

/**
 * GET /api/sessions/[id]
 * 특정 세션 조회
 */
export async function GET({ params }) {
	try {
		const session = await getSession(params.id);
		
		if (!session) {
			return json({ 
				error: '세션을 찾을 수 없습니다.' 
			}, { status: 404 });
		}
		
		return json({ session });
	} catch (error) {
		console.error('❌ 세션 조회 오류:', error);
		return json({ 
			error: '세션 조회에 실패했습니다.',
			details: error.message 
		}, { status: 500 });
	}
}

/**
 * PATCH /api/sessions/[id]
 * 세션 업데이트 (제목 등)
 */
export async function PATCH({ params, request }) {
	try {
		const body = await request.json();
		const { title, firstMessage } = body;
		
		if (firstMessage) {
			await updateSessionTitle(params.id, firstMessage);
		}
		
		const session = await getSession(params.id);
		
		if (!session) {
			return json({ 
				error: '세션을 찾을 수 없습니다.' 
			}, { status: 404 });
		}
		
		return json({ 
			session,
			message: '세션이 업데이트되었습니다.'
		});
	} catch (error) {
		console.error('❌ 세션 업데이트 오류:', error);
		return json({ 
			error: '세션 업데이트에 실패했습니다.',
			details: error.message 
		}, { status: 500 });
	}
}

/**
 * DELETE /api/sessions/[id]
 * 세션 삭제
 */
export async function DELETE({ params }) {
	try {
		const deleted = await deleteSession(params.id);
		
		if (!deleted) {
			return json({ 
				error: '세션을 찾을 수 없습니다.' 
			}, { status: 404 });
		}
		
		return json({ 
			message: '세션이 삭제되었습니다.',
			deleted: true
		});
	} catch (error) {
		console.error('❌ 세션 삭제 오류:', error);
		return json({ 
			error: '세션 삭제에 실패했습니다.',
			details: error.message 
		}, { status: 500 });
	}
}

