/**
 * WebWorker for decoding base64 images
 * Runs in separate thread to avoid blocking UI
 */

self.onmessage = async function(e) {
  const { id, base64 } = e.data;
  
  try {
    // Decode base64 to blob
    const src = `data:image/jpeg;base64,${base64}`;
    const response = await fetch(src);
    const blob = await response.blob();
    
    // Create ImageBitmap (hardware accelerated)
    const bitmap = await createImageBitmap(blob);
    
    // Transfer bitmap to main thread (zero-copy)
    self.postMessage({ 
      id, 
      bitmap,
      success: true 
    }, [bitmap]);
    
  } catch (error) {
    self.postMessage({ 
      id, 
      error: error.message,
      success: false 
    });
  }
};
