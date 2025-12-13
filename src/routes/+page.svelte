<script>
	import RealtimeAgent from '$lib/components/RealtimeAgent.svelte';
	import AIAvatar from '$lib/components/AIAvatar.svelte';
	import StatusIndicator from '$lib/components/StatusIndicator.svelte';
	import ConversationLog from '$lib/components/ConversationLog.svelte';
	import ConnectionController from '$lib/components/ConnectionController.svelte';
	import DebugPanel from '$lib/components/DebugPanel.svelte';
	
	let realtimeAgent;
	let isConnected = false;
	let isConnecting = false;
	let isSpeaking = false;
	let isDisconnecting = false;
	let error = null;
	let messages = [];
	let debugLogs = [];
	let showDebugPanel = false;
	let connectionStatus = null;
	
	// 대화 로그에 메시지 추가
	function addToLog(speaker, message) {
		messages = [...messages, {
			speaker,
			message,
			timestamp: new Date().toLocaleTimeString()
		}];
	}
	
	// 대화 기록 지우기
	function clearLog() {
		messages = [];
	}
	
	// 이벤트 핸들러들
	function handleConnected() {
		console.log('Connected to AI');
	}
	
	function handleDisconnected() {
		console.log('Disconnected from AI');
		isDisconnecting = false;
	}
	
	function handleMessage(event) {
		// 이미 timestamp가 있는 경우 그대로 사용, 없으면 추가
		const messageWithTimestamp = {
			...event.detail,
			timestamp: event.detail.timestamp || new Date().toLocaleTimeString()
		};
		messages = [...messages, messageWithTimestamp];
	}
	
	function handleSpeaking(event) {
		console.log('AI speaking:', event.detail);
	}
	
	function handleError(event) {
		console.error('Agent error:', event.detail);
		error = event.detail;
		isDisconnecting = false;
	}
	
	function handleDebug(event) {
		debugLogs = [event.detail, ...debugLogs].slice(0, 50); // 최근 50개만 유지
	}
	
	// ConnectionController 이벤트 핸들러들
	function handleConnectionLog(event) {
		const messageWithTimestamp = {
			speaker: event.detail.speaker,
			message: event.detail.message,
			timestamp: new Date().toLocaleTimeString()
		};
		messages = [...messages, messageWithTimestamp];
	}
	
	function handleConnectionError(event) {
		error = event.detail;
	}
	
	function handleToggleDebug() {
		showDebugPanel = !showDebugPanel;
	}
	
	// DebugPanel 이벤트 핸들러들
	function handleClearLogs() {
		debugLogs = [];
	}
</script>

<svelte:head>
	<title>실시간 영어회화 AI</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
	<div class="max-w-4xl mx-auto">
		<!-- 헤더 -->
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold text-gray-800 mb-2">실시간 영어회화 AI</h1>
			<p class="text-gray-600">OpenAI Realtime API로 자연스러운 영어 대화를 연습해보세요</p>
			
			<!-- 대화 기록 페이지 링크 -->
			<a 
				href="/history" 
				class="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors text-sm font-medium"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
				</svg>
				대화 기록 보기
			</a>
		</div>
		
		<!-- AI 아바타 -->
		<AIAvatar {isConnected} {isSpeaking} />
		
		<!-- 상태 표시 -->
		<StatusIndicator {isConnected} {isConnecting} {isSpeaking} {isDisconnecting} {connectionStatus} />
		
		<!-- 연결 컨트롤러 -->
		<ConnectionController
			{realtimeAgent}
			{isConnected}
			{isConnecting}
			{isDisconnecting}
			{connectionStatus}
			on:log={handleConnectionLog}
			on:error={handleConnectionError}
			on:toggle-debug={handleToggleDebug}
		/>
		
		<!-- 디버그 패널 -->
		<DebugPanel
			{debugLogs}
			{error}
			{connectionStatus}
			{showDebugPanel}
			on:clear-logs={handleClearLogs}
		/>
		
		<!-- 대화 기록 -->
		<ConversationLog {messages} />
		
		<!-- 실시간 에이전트 컴포넌트 -->
		<RealtimeAgent
			bind:this={realtimeAgent}
			bind:isConnected
			bind:isConnecting
			bind:isSpeaking
			bind:isDisconnecting
			bind:error
			on:connected={handleConnected}
			on:disconnected={handleDisconnected}
			on:speaking={handleSpeaking}
			on:message={handleMessage}
			on:debug={handleDebug}
			on:error={handleError}
		/>
	</div>
</div>
