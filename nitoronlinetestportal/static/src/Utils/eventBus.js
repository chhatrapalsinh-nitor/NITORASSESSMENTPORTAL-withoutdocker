export const setupWindowEventBus = () => {
  if (window.EventBus) {
    return;
  }
  window.EventBus = {
    subscribe: (eventName, callback) => {
      if (!window.eventMap) {
        window.eventMap = {};
      }
      if (!eventMap[eventName]) {
        eventMap[eventName] = [];
      }
      eventMap[eventName].push(callback);
      return eventMap[eventName].length;
    },

    unsubscribe: (eventName) => {
      if (eventMap && eventMap[eventName]) {
        delete eventMap[eventName];
      }
    },

    publish: (eventName, payload) => {
      if (eventMap && eventMap[eventName]) {
        for (let i = 0; i < eventMap[eventName].length; i++) {
          return eventMap[eventName][i](payload);
        }
      }
    },
  };
}

