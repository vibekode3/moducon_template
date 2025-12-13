<script>
	import { onMount } from 'svelte';
	
	let sessions = [];
	let loading = true;
	let error = null;
	let selectedSession = null;
	let messages = [];
	let loadingMessages = false;
	
	// 세션 목록 로드
	async function loadSessions() {
		loading = true;
		error = null;
		
		try {
			const response = await fetch('/api/sessions?limit=50');
			if (!response.ok) {
				throw new Error('세션 목록을 불러오는데 실패했습니다.');
			}
			
			const data = await response.json();
			sessions = data.sessions || [];
		} catch (err) {
			error = err.message;
			console.error('세션 로드 오류:', err);
		} finally {
			loading = false;
		}
	}
	
	// 세션 선택 및 메시지 로드
	async function selectSession(session) {
		selectedSession = session;
		loadingMessages = true;
		messages = [];
		
		try {
			const response = await fetch(`/api/sessions/${session.id}/messages`);
			if (!response.ok) {
				throw new Error('메시지를 불러오는데 실패했습니다.');
			}
			
			const data = await response.json();
			messages = data.messages || [];
		} catch (err) {
			console.error('메시지 로드 오류:', err);
			error = err.message;
		} finally {
			loadingMessages = false;
		}
	}
	
	// 세션 삭제
	async function deleteSession(sessionId) {
		if (!confirm('이 대화 기록을 삭제하시겠습니까?')) return;
		
		try {
			const response = await fetch(`/api/sessions/${sessionId}`, {
				method: 'DELETE'
			});
			
			if (!response.ok) {
				throw new Error('세션 삭제에 실패했습니다.');
			}
			
			// 목록에서 제거
			sessions = sessions.filter(s => s.id !== sessionId);
			
			// 선택된 세션이 삭제된 경우 선택 해제
			if (selectedSession?.id === sessionId) {
				selectedSession = null;
				messages = [];
			}
		} catch (err) {
			console.error('세션 삭제 오류:', err);
			alert(err.message);
		}
	}
	
	// 날짜 포맷팅
	function formatDate(dateString) {
		const date = new Date(dateString);
		const now = new Date();
		const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
		
		if (diffDays === 0) {
			return '오늘 ' + date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
		} else if (diffDays === 1) {
			return '어제 ' + date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
		} else if (diffDays < 7) {
			return `${diffDays}일 전`;
		} else {
			return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
		}
	}
	
	// 시간 포맷팅
	function formatTime(dateString) {
		const date = new Date(dateString);
		return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
	}
	
	// 날짜별 그룹화
	function groupSessionsByDate(sessions) {
		const groups = {};
		
		sessions.forEach(session => {
			const date = new Date(session.created_at).toLocaleDateString('ko-KR', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
			
			if (!groups[date]) {
				groups[date] = [];
			}
			groups[date].push(session);
		});
		
		return groups;
	}
	
	$: groupedSessions = groupSessionsByDate(sessions);
	
	onMount(() => {
		loadSessions();
	});
</script>

<svelte:head>
	<title>대화 기록 - 실시간 영어회화 AI</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
	<!-- 헤더 -->
	<header class="bg-black/30 backdrop-blur-sm border-b border-white/10">
		<div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
			<div class="flex items-center gap-4">
				<a href="/" class="text-white/70 hover:text-white transition-colors">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
					</svg>
				</a>
				<h1 class="text-2xl font-bold text-white">대화 기록</h1>
			</div>
			<button 
				on:click={loadSessions}
				class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
				</svg>
				새로고침
			</button>
		</div>
	</header>
	
	<div class="max-w-7xl mx-auto px-4 py-6">
		{#if loading}
			<div class="flex items-center justify-center py-20">
				<div class="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
			</div>
		{:else if error}
			<div class="bg-red-500/20 border border-red-500/50 rounded-lg p-6 text-center">
				<p class="text-red-300">{error}</p>
				<button 
					on:click={loadSessions}
					class="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
				>
					다시 시도
				</button>
			</div>
		{:else if sessions.length === 0}
			<div class="text-center py-20">
				<div class="text-6xl mb-4">📭</div>
				<h2 class="text-2xl font-bold text-white mb-2">대화 기록이 없습니다</h2>
				<p class="text-white/60 mb-6">AI 선생님과 대화를 시작하면 여기에 기록됩니다.</p>
				<a 
					href="/"
					class="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
					</svg>
					대화 시작하기
				</a>
			</div>
		{:else}
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<!-- 세션 목록 -->
				<div class="lg:col-span-1 space-y-4">
					<div class="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
						<div class="p-4 border-b border-white/10">
							<h2 class="text-lg font-semibold text-white">
								전체 대화 ({sessions.length}개)
							</h2>
						</div>
						
						<div class="max-h-[calc(100vh-280px)] overflow-y-auto">
							{#each Object.entries(groupedSessions) as [date, dateSessions]}
								<div class="px-4 py-2 bg-white/5 border-b border-white/10">
									<span class="text-sm font-medium text-purple-300">{date}</span>
								</div>
								
								{#each dateSessions as session}
									<div
										class="w-full p-4 text-left hover:bg-white/5 transition-colors border-b border-white/5 cursor-pointer
											{selectedSession?.id === session.id ? 'bg-purple-500/20 border-l-4 border-l-purple-500' : ''}"
									>
										<div class="flex items-start justify-between gap-2">
											<div 
												class="flex-1 min-w-0 cursor-pointer"
												on:click={() => selectSession(session)}
												on:keydown={(e) => e.key === 'Enter' && selectSession(session)}
												role="button"
												tabindex="0"
											>
												<h3 class="text-white font-medium truncate">
													{session.title || '제목 없음'}
												</h3>
												<p class="text-sm text-white/50 mt-1">
													{formatDate(session.created_at)} · {session.message_count}개 메시지
												</p>
											</div>
											<button
												on:click={() => deleteSession(session.id)}
												class="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors flex-shrink-0"
												title="삭제"
											>
												<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
												</svg>
											</button>
										</div>
									</div>
								{/each}
							{/each}
						</div>
					</div>
				</div>
				
				<!-- 메시지 뷰어 -->
				<div class="lg:col-span-2">
					<div class="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden h-[calc(100vh-200px)]">
						{#if !selectedSession}
							<div class="h-full flex items-center justify-center text-center p-8">
								<div>
									<div class="text-5xl mb-4">👈</div>
									<h3 class="text-xl font-semibold text-white mb-2">대화를 선택하세요</h3>
									<p class="text-white/50">왼쪽 목록에서 대화를 선택하면 내용을 볼 수 있습니다.</p>
								</div>
							</div>
						{:else if loadingMessages}
							<div class="h-full flex items-center justify-center">
								<div class="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent"></div>
							</div>
						{:else}
							<!-- 선택된 세션 헤더 -->
							<div class="p-4 border-b border-white/10 bg-white/5">
								<h3 class="text-lg font-semibold text-white">
									{selectedSession.title || '제목 없음'}
								</h3>
								<p class="text-sm text-white/50 mt-1">
									{new Date(selectedSession.created_at).toLocaleString('ko-KR')} · {messages.length}개 메시지
								</p>
							</div>
							
							<!-- 메시지 목록 -->
							<div class="p-4 space-y-4 overflow-y-auto h-[calc(100%-80px)]">
								{#if messages.length === 0}
									<div class="text-center py-10 text-white/50">
										메시지가 없습니다.
									</div>
								{:else}
									{#each messages as message}
										<div class="flex gap-3 {message.speaker === '나' ? 'flex-row-reverse' : ''}">
											<!-- 아바타 -->
											<div class="flex-shrink-0">
												{#if message.speaker === '나'}
													<div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
														<span class="text-white text-sm font-bold">나</span>
													</div>
												{:else if message.speaker === 'AI 선생님'}
													<div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
														<span class="text-white text-xs font-bold">AI</span>
													</div>
												{:else}
													<div class="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
														<span class="text-white text-xs">⚙️</span>
													</div>
												{/if}
											</div>
											
											<!-- 메시지 내용 -->
											<div class="flex-1 max-w-[80%] {message.speaker === '나' ? 'text-right' : ''}">
												<div class="flex items-center gap-2 mb-1 {message.speaker === '나' ? 'justify-end' : ''}">
													<span class="text-sm font-medium text-white/70">{message.speaker}</span>
													<span class="text-xs text-white/40">{formatTime(message.timestamp)}</span>
												</div>
												<div class="inline-block p-3 rounded-2xl {message.speaker === '나' 
													? 'bg-blue-500 text-white rounded-tr-sm' 
													: message.speaker === 'AI 선생님'
														? 'bg-white/10 text-white rounded-tl-sm'
														: 'bg-gray-500/30 text-white/70 rounded-tl-sm text-sm'}">
													<p class="whitespace-pre-wrap">{message.message}</p>
												</div>
											</div>
										</div>
									{/each}
								{/if}
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

