/* */ 
(function(process) {
  'use strict';
  exports.__esModule = true;
  exports['default'] = combineReducers;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
  }
  var _createStore = require('../createStore');
  var _utilsIsPlainObject = require('./isPlainObject');
  var _utilsIsPlainObject2 = _interopRequireDefault(_utilsIsPlainObject);
  var _utilsMapValues = require('./mapValues');
  var _utilsMapValues2 = _interopRequireDefault(_utilsMapValues);
  var _utilsPick = require('./pick');
  var _utilsPick2 = _interopRequireDefault(_utilsPick);
  function getUndefinedStateErrorMessage(key, action) {
    var actionType = action && action.type;
    var actionName = actionType && '"' + actionType.toString() + '"' || 'an action';
    return 'Reducer "' + key + '" returned undefined handling ' + actionName + '. ' + 'To ignore an action, you must explicitly return the previous state.';
  }
  function getUnexpectedStateKeyWarningMessage(inputState, outputState, action) {
    var reducerKeys = Object.keys(outputState);
    var argumentName = action && action.type === _createStore.ActionTypes.INIT ? 'initialState argument passed to createStore' : 'previous state received by the reducer';
    if (reducerKeys.length === 0) {
      return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
    }
    if (!_utilsIsPlainObject2['default'](inputState)) {
      return 'The ' + argumentName + ' has unexpected type of "' + ({}).toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] + '". Expected argument to be an object with the following ' + ('keys: "' + reducerKeys.join('", "') + '"');
    }
    var unexpectedKeys = Object.keys(inputState).filter(function(key) {
      return reducerKeys.indexOf(key) < 0;
    });
    if (unexpectedKeys.length > 0) {
      return 'Unexpected ' + (unexpectedKeys.length > 1 ? 'keys' : 'key') + ' ' + ('"' + unexpectedKeys.join('", "') + '" found in ' + argumentName + '. ') + 'Expected to find one of the known reducer keys instead: ' + ('"' + reducerKeys.join('", "') + '". Unexpected keys will be ignored.');
    }
  }
  function assertReducerSanity(reducers) {
    Object.keys(reducers).forEach(function(key) {
      var reducer = reducers[key];
      var initialState = reducer(undefined, {type: _createStore.ActionTypes.INIT});
      if (typeof initialState === 'undefined') {
        throw new Error('Reducer "' + key + '" returned undefined during initialization. ' + 'If the state passed to the reducer is undefined, you must ' + 'explicitly return the initial state. The initial state may ' + 'not be undefined.');
      }
      var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.');
      if (typeof reducer(undefined, {type: type}) === 'undefined') {
        throw new Error('Reducer "' + key + '" returned undefined when probed with a random type. ' + ('Don\'t try to handle ' + _createStore.ActionTypes.INIT + ' or other actions in "redux/*" ') + 'namespace. They are considered private. Instead, you must return the ' + 'current state for any unknown actions, unless it is undefined, ' + 'in which case you must return the initial state, regardless of the ' + 'action type. The initial state may not be undefined.');
      }
    });
  }
  function combineReducers(reducers) {
    var finalReducers = _utilsPick2['default'](reducers, function(val) {
      return typeof val === 'function';
    });
    var sanityError;
    try {
      assertReducerSanity(finalReducers);
    } catch (e) {
      sanityError = e;
    }
    var defaultState = _utilsMapValues2['default'](finalReducers, function() {
      return undefined;
    });
    return function combination(state, action) {
      if (state === undefined)
        state = defaultState;
      if (sanityError) {
        throw sanityError;
      }
      var finalState = _utilsMapValues2['default'](finalReducers, function(reducer, key) {
        var newState = reducer(state[key], action);
        if (typeof newState === 'undefined') {
          var errorMessage = getUndefinedStateErrorMessage(key, action);
          throw new Error(errorMessage);
        }
        return newState;
      });
      if (process.env.NODE_ENV !== 'production') {
        var warningMessage = getUnexpectedStateKeyWarningMessage(state, finalState, action);
        if (warningMessage) {
          console.error(warningMessage);
        }
      }
      return finalState;
    };
  }
  module.exports = exports['default'];
})(require('process'));
