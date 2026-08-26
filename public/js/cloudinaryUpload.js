/**
 * Cloudinary Direct Browser Upload Helper
 * Handles uploading files directly from the browser to Cloudinary
 * showing a progress bar and returning the secure URL.
 */

class CloudinaryUploader {
    /**
     * Initializes a file input for direct Cloudinary upload
     * @param {HTMLInputElement} fileInput The original file input element
     */
    static init(fileInput) {
        if (!fileInput || fileInput.hasAttribute('data-cloudinary-initialized')) return;
        
        fileInput.setAttribute('data-cloudinary-initialized', 'true');
        
        const originalName = fileInput.getAttribute('name');
        const accept = fileInput.getAttribute('accept') || 'auto';
        const isMultiple = fileInput.hasAttribute('multiple');
        const isAudio = accept.includes('audio');
        const isVideo = accept.includes('video');
        
        const resourceType = isAudio || isVideo ? 'video' : (accept.includes('image') ? 'image' : 'auto');
        
        // Create hidden input to store the final URL(s)
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = originalName;
        // If multiple, we might need to handle arrays differently depending on backend.
        // Usually, backends expect multiple inputs with the same name.
        
        // Rename original input so it doesn't get submitted
        fileInput.removeAttribute('name');
        fileInput.setAttribute('data-original-name', originalName);
        
        // Create progress UI
        const progressContainer = document.createElement('div');
        progressContainer.className = 'cloudinary-progress-container';
        progressContainer.style.display = 'none';
        progressContainer.style.marginTop = '10px';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'cloudinary-progress-bar';
        progressBar.style.width = '0%';
        progressBar.style.height = '10px';
        progressBar.style.backgroundColor = '#2ecc71';
        progressBar.style.borderRadius = '5px';
        progressBar.style.transition = 'width 0.2s';
        
        const progressText = document.createElement('span');
        progressText.className = 'cloudinary-progress-text';
        progressText.style.fontSize = '0.85em';
        progressText.style.color = '#666';
        progressText.style.display = 'block';
        progressText.style.marginTop = '5px';
        
        const previewContainer = document.createElement('div');
        previewContainer.className = 'cloudinary-preview-container';
        previewContainer.style.marginTop = '10px';
        previewContainer.style.display = 'flex';
        previewContainer.style.flexWrap = 'wrap';
        previewContainer.style.gap = '10px';
        
        progressContainer.appendChild(progressBar);
        progressContainer.appendChild(progressText);
        
        fileInput.parentNode.insertBefore(hiddenInput, fileInput.nextSibling);
        fileInput.parentNode.insertBefore(progressContainer, hiddenInput.nextSibling);
        fileInput.parentNode.insertBefore(previewContainer, progressContainer.nextSibling);
        
        // Store uploaded URLs for multiple support
        let uploadedUrls = [];

        fileInput.addEventListener('change', async (e) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;
            
            // Disable submit button during upload
            const form = fileInput.closest('form');
            const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
            if (submitBtn) submitBtn.disabled = true;
            
            progressContainer.style.display = 'block';
            previewContainer.innerHTML = ''; // Clear previews
            
            if (!isMultiple) {
                uploadedUrls = []; // Reset for single files
                // Remove existing multiple hidden inputs if any (clean up)
                const existingHiddens = fileInput.parentNode.querySelectorAll(`input[name="${originalName}"]`);
                existingHiddens.forEach((input, index) => {
                    if(index > 0) input.remove();
                });
            }

            let allSuccessful = true;
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                progressText.innerText = `جاري الرفع... ${i+1} من ${files.length} (${file.name})`;
                progressBar.style.width = '0%';
                
                try {
                    let typeForThisFile = resourceType;
                    if (file.name.match(/\.(pdf|doc|docx|xls|xlsx|txt|csv)$/i)) {
                        typeForThisFile = 'raw';
                    }

                    const url = await this.uploadFile(file, typeForThisFile, (percent) => {
                        progressBar.style.width = `${percent}%`;
                        if(percent === 100) {
                            progressText.innerText = `جاري المعالجة... ${i+1} من ${files.length}`;
                        } else {
                           progressText.innerText = `جاري الرفع... ${Math.round(percent)}% - ${i+1} من ${files.length}`; 
                        }
                    });
                    
                    if (url) {
                        uploadedUrls.push(url);
                        this.addPreview(previewContainer, url, resourceType, file.name);
                    }
                } catch (error) {
                    console.error("Upload failed for", file.name, error);
                    allSuccessful = false;
                    Swal.fire({
                        icon: 'error',
                        title: 'خطأ في الرفع',
                        text: `فشل رفع الملف ${file.name}. الرجاء المحاولة مرة أخرى.`
                    });
                }
            }
            
            // Update hidden inputs
            if (isMultiple) {
                // Remove all existing hidden inputs for this field
                const existingHiddens = fileInput.parentNode.querySelectorAll(`input[type="hidden"][name="${originalName}"]`);
                existingHiddens.forEach(el => el.remove());
                
                // Create a hidden input for each URL
                uploadedUrls.forEach(url => {
                    const hi = document.createElement('input');
                    hi.type = 'hidden';
                    hi.name = originalName;
                    hi.value = url;
                    fileInput.parentNode.insertBefore(hi, fileInput.nextSibling);
                });
            } else {
                hiddenInput.value = uploadedUrls[0] || '';
            }
            
            if (allSuccessful) {
                progressText.innerText = 'تم الرفع بنجاح!';
                progressText.style.color = '#2ecc71';
            } else {
                progressText.innerText = 'حدث خطأ في بعض الملفات.';
                progressText.style.color = '#e74c3c';
            }
            
            if (submitBtn) submitBtn.disabled = false;
        });
    }

    /**
     * Get Signature and Upload to Cloudinary
     */
    static uploadFile(file, resourceType, onProgress) {
        return new Promise(async (resolve, reject) => {
            try {
                // 1. Get Signature
                const signResponse = await fetch('/api/cloudinary/sign', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resourceType })
                });
                
                if (!signResponse.ok) throw new Error("Failed to get signature");
                const signData = await signResponse.json();
                
                // 2. Prepare FormData
                const formData = new FormData();
                formData.append('file', file);
                formData.append('api_key', signData.apiKey);
                formData.append('timestamp', signData.timestamp);
                formData.append('signature', signData.signature);
                formData.append('folder', signData.folder);
                
                // 3. Upload using XMLHttpRequest for progress
                const xhr = new XMLHttpRequest();
                const uploadUrl = `https://api.cloudinary.com/v1_1/${signData.cloudName}/${resourceType}/upload`;
                
                xhr.open('POST', uploadUrl, true);
                
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const percent = (e.loaded / e.total) * 100;
                        if (onProgress) onProgress(percent);
                    }
                };
                
                xhr.onload = () => {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response.secure_url);
                    } else {
                        reject(new Error(xhr.responseText));
                    }
                };
                
                xhr.onerror = () => reject(new Error("Network Error"));
                
                xhr.send(formData);
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    static addPreview(container, url, type, filename) {
        const wrapper = document.createElement('div');
        wrapper.style.border = '1px solid #ddd';
        wrapper.style.padding = '5px';
        wrapper.style.borderRadius = '4px';
        wrapper.style.position = 'relative';
        wrapper.style.width = '100px';
        
        let media;
        if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i) || type === 'image') {
            media = document.createElement('img');
            media.src = url;
            media.style.width = '100%';
            media.style.height = '80px';
            media.style.objectFit = 'cover';
        } else if (url.match(/\.(mp4|webm|ogg)$/i) || type === 'video') {
            media = document.createElement('video');
            media.src = url;
            media.style.width = '100%';
            media.style.height = '80px';
            media.style.objectFit = 'cover';
            media.style.backgroundColor = '#000';
        } else if (url.match(/\.(mp3|wav|m4a)$/i) || type === 'video') { // Cloudinary treats audio as video resource_type but extension is audio
             media = document.createElement('div');
             media.innerHTML = '<i class="fa-solid fa-file-audio" style="font-size: 3em; color: var(--primary-color);"></i>';
             media.style.width = '100%';
             media.style.height = '80px';
             media.style.display = 'flex';
             media.style.alignItems = 'center';
             media.style.justifyContent = 'center';
             media.style.backgroundColor = '#f4f4f4';
        } else {
             media = document.createElement('div');
             media.innerHTML = '<i class="fa-solid fa-file" style="font-size: 3em; color: #888;"></i>';
             media.style.width = '100%';
             media.style.height = '80px';
             media.style.display = 'flex';
             media.style.alignItems = 'center';
             media.style.justifyContent = 'center';
             media.style.backgroundColor = '#f4f4f4';
        }
        
        const title = document.createElement('div');
        title.innerText = filename;
        title.style.fontSize = '10px';
        title.style.overflow = 'hidden';
        title.style.textOverflow = 'ellipsis';
        title.style.whiteSpace = 'nowrap';
        title.style.marginTop = '4px';
        
        wrapper.appendChild(media);
        wrapper.appendChild(title);
        container.appendChild(wrapper);
    }
}

// Auto-initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all file inputs
    document.querySelectorAll('input[type="file"]').forEach(input => {
        CloudinaryUploader.init(input);
    });
    
    // Observer for dynamically added file inputs (like in dynamic arrays)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // Element node
                    if (node.tagName === 'INPUT' && node.type === 'file') {
                        CloudinaryUploader.init(node);
                    } else {
                        node.querySelectorAll('input[type="file"]').forEach(input => {
                            CloudinaryUploader.init(input);
                        });
                    }
                }
            });
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
});
