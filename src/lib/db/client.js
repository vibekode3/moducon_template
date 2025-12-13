import { DATABASE_URL } from '$env/static/private';

/**
 * PostgreSQL 데이터베이스 클라이언트
 * Supabase PostgreSQL에 직접 연결
 */

// 동적으로 pg 모듈 로드 (서버 사이드에서만 사용)
let pool = null;

async function getPool() {
	if (pool) return pool;
	
	const pg = await import('pg');
	const Pool = pg.default.Pool || pg.Pool;
	
	pool = new Pool({
		connectionString: DATABASE_URL,
		ssl: {
			rejectUnauthorized: false
		},
		max: 10,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 10000
	});
	
	pool.on('error', (err) => {
		console.error('Unexpected database pool error:', err);
	});
	
	return pool;
}

/**
 * 쿼리 실행 함수
 * @param {string} text - SQL 쿼리
 * @param {any[]} params - 쿼리 파라미터
 * @returns {Promise<any>} 쿼리 결과
 */
export async function query(text, params = []) {
	const pool = await getPool();
	const start = Date.now();
	
	try {
		const result = await pool.query(text, params);
		const duration = Date.now() - start;
		console.log('📊 DB Query:', { text: text.substring(0, 100), duration: `${duration}ms`, rows: result.rowCount });
		return result;
	} catch (error) {
		console.error('❌ DB Query Error:', { text: text.substring(0, 100), error: error.message });
		throw error;
	}
}

/**
 * 트랜잭션 실행 함수
 * @param {Function} callback - 트랜잭션 내에서 실행할 함수
 * @returns {Promise<any>} 트랜잭션 결과
 */
export async function transaction(callback) {
	const pool = await getPool();
	const client = await pool.connect();
	
	try {
		await client.query('BEGIN');
		const result = await callback(client);
		await client.query('COMMIT');
		return result;
	} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	} finally {
		client.release();
	}
}

export default { query, transaction };

