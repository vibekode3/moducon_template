<script>
	export let isConnected = false;
	export let isSpeaking = false;
</script>

<div class="flex justify-center mb-8">
	<div class="relative">
		<!-- AI 에이전트 아바타 -->
		<div class="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg relative">
			{#if isConnected}
				<div class="w-24 h-24 bg-white rounded-full flex items-center justify-center">
					{#if isSpeaking}
						<div class="w-16 h-16 bg-green-400 rounded-full animate-pulse flex items-center justify-center">
							<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20" role="img" aria-label="AI가 말하고 있음">
								<path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.846 14H2a1 1 0 01-1-1V7a1 1 0 011-1h2.846l3.537-2.816a1 1 0 011.617.816zM16 7a1 1 0 011 1v4a1 1 0 11-2 0V8a1 1 0 011-1z" clip-rule="evenodd"></path>
								<path fill-rule="evenodd" d="M14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clip-rule="evenodd"></path>
							</svg>
						</div>
					{:else}
						<div class="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center">
							<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20" role="img" aria-label="대화 준비 완료">
								<path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd"></path>
							</svg>
						</div>
					{/if}
				</div>
				<!-- 연결 상태 표시 -->
				<div class="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
					<div class="w-3 h-3 bg-white rounded-full"></div>
				</div>
			{:else}
				<div class="w-24 h-24 bg-white rounded-full flex items-center justify-center opacity-50">
					<svg class="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20" role="img" aria-label="연결되지 않음">
						<path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 01 5 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd"></path>
					</svg>
				</div>
			{/if}
		</div>
	</div>
</div> 