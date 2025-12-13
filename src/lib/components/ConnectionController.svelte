<script>
	import { createEventDispatcher, onDestroy } from 'svelte';
	
	const dispatch = createEventDispatcher();
	
	export let realtimeAgent = null;
	export let isConnected = false;
	export let isConnecting = false;
	export let isDisconnecting = false;
	export let connectionStatus = null;
	
	let statusCheckInterval = null;
	
	// 연결 상태 주기적 확인
	function startStatusMonitoring() {
		if (statusCheckInterval) {
			clearInterval(statusCheckInterval);
		}
		
		statusCheckInterval = setInterval(() => {
			if (realtimeAgent) {
				connectionStatus = realtimeAgent.getConnectionStatus();
			}
		}, 2000); // 2초마다 상태 확인
	}
	
	function stopStatusMonitoring() {
		if (statusCheckInterval) {
			clearInterval(statusCheckInterval);
			statusCheckInterval = null;
		}
		connectionStatus = null;
	}
	
	// 연결 시작
	async function handleConnect() {
		try {
			await realtimeAgent.connect();
		} catch (err) {
			console.error('Connection failed:', err);
			dispatch('error', err.message);
		}
	}
	
	// 연결 해제
	async function handleDisconnect() {
		try {
			await realtimeAgent.disconnect();
			
			// 연결 해제 후 추가 검증
			setTimeout(() => {
				if (realtimeAgent) {
					const finalStatus = realtimeAgent.getConnectionStatus();
					dispatch('log', {
						speaker: '시스템',
						message: `연결 종료 검증 완료: ${JSON.stringify(finalStatus, null, 2)}`
					});
					
					// 모든 연결이 정상적으로 종료되었는지 확인
					const isFullyDisconnected = 
						!finalStatus.hasPC && 
						!finalStatus.hasDataChannel && 
						!finalStatus.hasLocalStream && 
						!finalStatus.hasAudioElement;
					
					if (isFullyDisconnected) {
						dispatch('log', {
							speaker: '시스템',
							message: '✅ 모든 연결이 안전하게 종료되었습니다. 과금이 중단되었습니다.'
						});
					} else {
						dispatch('log', {
							speaker: '시스템',
							message: '⚠️ 일부 연결이 남아있을 수 있습니다. 페이지를 새로고침하는 것을 권장합니다.'
						});
					}
				}
			}, 2000); // 2초 후 검증
			
		} catch (err) {
			console.error('Disconnect failed:', err);
			dispatch('log', {
				speaker: '시스템',
				message: `연결 해제 중 오류 발생: ${err.message}`
			});
			dispatch('error', err.message);
		}
	}
	
	// 강제 연결 상태 확인
	function checkConnectionStatus() {
		if (realtimeAgent) {
			connectionStatus = realtimeAgent.getConnectionStatus();
			dispatch('log', {
				speaker: '시스템',
				message: `연결 상태 확인: ${JSON.stringify(connectionStatus, null, 2)}`
			});
		}
	}
	
	// 연결 상태 변경 시 모니터링 시작/중지
	$: if (isConnected) {
		startStatusMonitoring();
	} else {
		stopStatusMonitoring();
	}
	
	// 컴포넌트 정리
	onDestroy(() => {
		stopStatusMonitoring();
	});
</script>

<!-- 연결 버튼 -->
<div class="flex justify-center gap-4 mb-8">
	{#if !isConnected && !isConnecting && !isDisconnecting}
		<button
			on:click={handleConnect}
			class="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
		>
			AI와 대화 시작
		</button>
	{:else if isConnecting}
		<button disabled class="bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold">
			연결 중...
		</button>
	{:else if isDisconnecting}
		<button disabled class="bg-orange-400 text-white px-8 py-3 rounded-lg font-semibold">
			안전하게 종료 중...
		</button>
	{:else}
		<button
			on:click={handleDisconnect}
			class="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
		>
			연결 해제
		</button>
	{/if}
	
	<!-- 연결 상태 확인 버튼 -->
	{#if isConnected || connectionStatus}
		<button
			on:click={checkConnectionStatus}
			class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
			title="현재 연결 상태 확인"
		>
			🔍 상태 확인
		</button>
	{/if}
	
	<!-- 디버그 패널 토글 버튼 -->
	<button
		on:click={() => dispatch('toggle-debug')}
		class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
		title="디버그 정보 보기"
	>
		🔧 디버그
	</button>
</div>

<!-- 과금 방지 안내 -->
{#if !isConnected && !isConnecting && !isDisconnecting}
	<div class="max-w-2xl mx-auto mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
		<div class="flex items-center">
			<div class="flex-shrink-0">
				<svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20" role="img" aria-label="안전한 상태">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
				</svg>
			</div>
			<div class="ml-3">
				<h3 class="text-sm font-medium text-green-800">안전한 상태</h3>
				<div class="mt-1 text-sm text-green-700">
					<p>현재 모든 API 연결이 중단된 상태입니다. 과금이 발생하지 않습니다.</p>
				</div>
			</div>
		</div>
	</div>
{:else if isConnected}
	<div class="max-w-2xl mx-auto mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
		<div class="flex items-center">
			<div class="flex-shrink-0">
				<svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" role="img" aria-label="API 사용 중 경고">
					<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
				</svg>
			</div>
			<div class="ml-3">
				<h3 class="text-sm font-medium text-yellow-800">API 사용 중</h3>
				<div class="mt-1 text-sm text-yellow-700">
					<p>현재 OpenAI API를 사용 중입니다. 대화 시간에 따라 과금이 발생할 수 있습니다.</p>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- 실시간 연결 상태 표시 (연결된 경우에만) -->
{#if connectionStatus && isConnected}
	<div class="max-w-2xl mx-auto mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
		<h4 class="font-semibold text-blue-800 mb-3">실시간 연결 상태</h4>
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
			<div>
				<span class="text-gray-600">WebRTC:</span>
				<span class="font-mono ml-1 {connectionStatus.pcState === 'connected' ? 'text-green-600' : connectionStatus.pcState === 'closed' ? 'text-red-600' : 'text-yellow-600'}">{connectionStatus.pcState}</span>
			</div>
			<div>
				<span class="text-gray-600">데이터채널:</span>
				<span class="font-mono ml-1 {connectionStatus.dataChannelState === 'open' ? 'text-green-600' : connectionStatus.dataChannelState === 'closed' ? 'text-red-600' : 'text-yellow-600'}">{connectionStatus.dataChannelState}</span>
			</div>
			<div>
				<span class="text-gray-600">마이크:</span>
				<span class="font-mono ml-1 {connectionStatus.localStreamActive ? 'text-green-600' : 'text-red-600'}">{connectionStatus.localStreamActive ? '활성' : '비활성'}</span>
			</div>
			<div>
				<span class="text-gray-600">연결시간:</span>
				<span class="font-mono ml-1">{Math.round(connectionStatus.connectionDuration / 1000)}초</span>
			</div>
		</div>
	</div>
{/if} 