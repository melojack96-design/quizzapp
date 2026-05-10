const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('quizAPI', {
  getRandomQuestion: (level) => ipcRenderer.invoke('quiz:getRandomQuestion', level),
  getMaxLevel: () => ipcRenderer.invoke('quiz:getMaxLevel'),
  getLevelCount: (level) => ipcRenderer.invoke('quiz:getLevelCount', level)
});
