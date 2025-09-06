// utils/storage.js
window.JobTrackerStorage = {
  async set(key, value) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [key]: value }, resolve);
    });
  },
  
  async get(key) {
    return new Promise((resolve) => {
      chrome.storage.sync.get([key], (result) => {
        resolve(result[key]);
      });
    });
  },
  
  async remove(key) {
    return new Promise((resolve) => {
      chrome.storage.sync.remove([key], resolve);
    });
  },
  
  async clear() {
    return new Promise((resolve) => {
      chrome.storage.sync.clear(resolve);
    });
  }
};
