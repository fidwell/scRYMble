global.GM_getValue = jest.fn().mockImplementation((key, defaultValue) => {
  return defaultValue;
});

global.GM_setValue = jest.fn().mockImplementation((key, value) => {
});
