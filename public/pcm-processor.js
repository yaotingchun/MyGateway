class PCMProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input && input[0]) {
      const channelData = input[0];
      // Convert Float32 samples from mic to 16-bit PCM (Int16)
      const pcmBuffer = new Int16Array(channelData.length);
      for (let i = 0; i < channelData.length; i++) {
        const s = Math.max(-1, Math.min(1, channelData[i]));
        pcmBuffer[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      // Post the buffer array directly as a transferrable object
      this.port.postMessage(pcmBuffer.buffer, [pcmBuffer.buffer]);
    }
    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);
