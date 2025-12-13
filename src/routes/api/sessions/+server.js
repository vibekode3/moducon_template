import { json } from '@sveltejs/kit';
import { createSession, getSessions, getSessionStats } from '$lib/db/sessions.js';

/**
 * GET /api/sessions
 * 세션 목록 조회
 */
export async function GET({ url }) {
	try {
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const offset = parseInt(url.searchParams.get('offset') || '0');
		const stats = url.searchParams.get('stats') === 'true';
		
		if (stats) {
			// 통계 조회
			const sessionStats = await getSessionStats(7);
			return json({ stats: sessionStats });
		}
		
		// 세션 목록 조회
		const sessions = await getSessions(limit, offset);
		
		return json({ 
			sessions,
			pagination: {
				limit,
				offset,
				hasMore: sessions.length === limit
			}
		});
	} catch (error) {
		console.error('❌ 세션 목록 조회 오류:', error);
		return json({ 
			error: '세션 목록을 불러오는데 실패했습니다.',
			details: error.message 
		}, { status: 500 });
	}
}

/**
 * POST /api/sessions
 * 새 세션 생성
 */
export async function POST() {
	try {
		const session = await createSession();
		console.log('✅ 새 세션 생성:', session.id);
		
		return json({ 
			session,
			message: '세션이 생성되었습니다.'
		}, { status: 201 });
	} catch (error) {
		console.error('❌ 세션 생성 오류:', error);
		return json({ 
			error: '세션 생성에 실패했습니다.',
			details: error.message 
		}, { status: 500 });
	}
}

