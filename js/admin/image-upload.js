const ImageUpload = {
  async convertToBase64(file) {
    return new Promise((resolve, reject) => {
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('File size exceeds 5MB limit'));
        return;
      }

      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        reject(new Error('Invalid file format. Only JPG, PNG, and WEBP allowed'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  async handleMultipleImages(files) {
    const images = [];
    for (const file of files) {
      try {
        const base64 = await this.convertToBase64(file);
        images.push(base64);
      } catch (error) {
        Utils.showToast(error.message, 'error');
      }
    }
    return images;
  },

  createPreview(base64, onRemove) {
    const preview = document.createElement('div');
    preview.className = 'image-preview';
    preview.innerHTML = `
      <img src="${base64}" alt="Preview">
      <button class="remove-preview-btn" type="button">×</button>
    `;

    const removeBtn = preview.querySelector('.remove-preview-btn');
    removeBtn.addEventListener('click', () => {
      if (onRemove) onRemove();
      preview.remove();
    });

    return preview;
  }
};
