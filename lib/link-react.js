(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"), require("link-lib"));
	else if(typeof define === 'function' && define.amd)
		define("link-react", ["react", "link-lib"], factory);
	else if(typeof exports === 'object')
		exports["link-react"] = factory(require("react"), require("link-lib"));
	else
		root["link-react"] = factory(root["React"], root["link-lib"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_4__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _components = __webpack_require__(1);
	
	Object.keys(_components).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _components[key];
	    }
	  });
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _PropertyBase = __webpack_require__(2);
	
	Object.defineProperty(exports, 'PropertyBase', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_PropertyBase).default;
	  }
	});
	
	var _Property = __webpack_require__(5);
	
	Object.defineProperty(exports, 'Property', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_Property).default;
	  }
	});
	
	var _RenderStoreProvider = __webpack_require__(6);
	
	Object.defineProperty(exports, 'RenderStoreProvider', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_RenderStoreProvider).default;
	  }
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var _react = __webpack_require__(3);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _linkLib = __webpack_require__(4);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	var LANG_PREF = ['nl', 'en'];
	
	var propTypes = {
	  label: _react.PropTypes.oneOfType([_react.PropTypes.arrayOf(_react.PropTypes.string), _react.PropTypes.string])
	};
	
	function allPropertyTypes(properties) {
	  var props = _linkLib.schema['@graph'].filter(function (obj) {
	    return (0, _linkLib.propertyIncludes)(obj['owl:sameAs'], properties);
	  }).map(function (obj) {
	    return (0, _linkLib.flattenProperty)(obj);
	  });
	  return properties.concat.apply(properties, _toConsumableArray(props));
	}
	
	function getValueOrID(prop) {
	  return prop && (prop['@value'] || prop['@id']);
	}
	
	function getPropBestLang(rawProp) {
	  if (!Array.isArray(rawProp)) {
	    return getValueOrID(rawProp);
	  }
	  if (rawProp.length === 1) {
	    return getValueOrID(rawProp[0]);
	  }
	
	  var _loop = function _loop(i) {
	    var pIndex = rawProp.findIndex(function (p) {
	      return p['@language'] === LANG_PREF[i];
	    });
	    if (pIndex >= 0) {
	      return {
	        v: getValueOrID(rawProp[pIndex])
	      };
	    }
	  };
	
	  for (var i = 0; i < LANG_PREF.length; i++) {
	    var _ret = _loop(i);
	
	    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	  }
	  return getValueOrID(rawProp[0]);
	}
	
	var PropertyBase = function (_React$Component) {
	  _inherits(PropertyBase, _React$Component);
	
	  function PropertyBase() {
	    _classCallCheck(this, PropertyBase);
	
	    return _possibleConstructorReturn(this, (PropertyBase.__proto__ || Object.getPrototypeOf(PropertyBase)).apply(this, arguments));
	  }
	
	  _createClass(PropertyBase, [{
	    key: 'getLinkedObjectPropertyRaw',
	    value: function getLinkedObjectPropertyRaw(property) {
	      var possibleProperties = allPropertyTypes(this.expandedProperty(property));
	      for (var i = 0; i < possibleProperties.length; i++) {
	        var prop = this.context.schemaObject[possibleProperties[i]];
	        if (prop) {
	          return prop;
	        }
	      }
	      return undefined;
	    }
	  }, {
	    key: 'getLinkedObjectProperty',
	    value: function getLinkedObjectProperty(property) {
	      var rawProp = this.getLinkedObjectPropertyRaw(property);
	      if (!rawProp) {
	        return undefined;
	      }
	      var val = getPropBestLang(rawProp);
	      return val && (Object.keys(val).length !== 0 || val.constructor !== Object) && (val.href || val.toString());
	    }
	  }, {
	    key: 'expandedProperty',
	    value: function expandedProperty(property) {
	      var prop = property || this.props.label;
	      if (Array.isArray(prop)) {
	        return prop.map(function (p) {
	          return (0, _linkLib.expandProperty)(p);
	        });
	      }
	      return [(0, _linkLib.expandProperty)(prop)];
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      return _react2.default.createElement(
	        'span',
	        null,
	        'PropBase: ',
	        this.getLinkedObjectProperty()
	      );
	    }
	  }]);
	
	  return PropertyBase;
	}(_react2.default.Component);
	
	PropertyBase.contextTypes = {
	  schemaObject: _react.PropTypes.object
	};
	PropertyBase.propTypes = propTypes;
	
	exports.default = PropertyBase;

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _react = __webpack_require__(3);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _PropertyBase2 = __webpack_require__(2);
	
	var _PropertyBase3 = _interopRequireDefault(_PropertyBase2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	/**
	 * Picks the best view for the given objects' property
	 *
	 * @param {Object} object The resource of which the property is rendered
	 *
	 * @param {String} property The property to be rendered
	 */
	var Property = function (_PropertyBase) {
	  _inherits(Property, _PropertyBase);
	
	  function Property() {
	    _classCallCheck(this, Property);
	
	    return _possibleConstructorReturn(this, (Property.__proto__ || Object.getPrototypeOf(Property)).apply(this, arguments));
	  }
	
	  _createClass(Property, [{
	    key: 'getLinkedObjectClass',
	    value: function getLinkedObjectClass() {
	      return this.context.linkedRenderStore.getRenderClassForProperty(this.context.schemaObject['@type'], this.expandedProperty(), this.context.topology);
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      var Klass = this.getLinkedObjectClass();
	      if (Klass) {
	        return _react2.default.createElement(Klass, this.props);
	      }
	      var obj = this.getLinkedObjectProperty();
	      if (obj) {
	        return _react2.default.createElement(
	          'div',
	          null,
	          obj
	        );
	      }
	      return null;
	    }
	  }]);
	
	  return Property;
	}(_PropertyBase3.default);
	
	Property.contextTypes = {
	  linkedRenderStore: _react.PropTypes.object,
	  schemaObject: _react.PropTypes.object,
	  topology: _react.PropTypes.string
	};
	
	exports.default = Property;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _react = __webpack_require__(3);
	
	var _react2 = _interopRequireDefault(_react);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var RenderStoreProvider = function (_Component) {
	  _inherits(RenderStoreProvider, _Component);
	
	  function RenderStoreProvider() {
	    _classCallCheck(this, RenderStoreProvider);
	
	    return _possibleConstructorReturn(this, (RenderStoreProvider.__proto__ || Object.getPrototypeOf(RenderStoreProvider)).apply(this, arguments));
	  }
	
	  _createClass(RenderStoreProvider, [{
	    key: 'getChildContext',
	    value: function getChildContext() {
	      return {
	        linkedRenderStore: this.props.linkedRenderStore
	      };
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      return this.props.children;
	    }
	  }]);
	
	  return RenderStoreProvider;
	}(_react.Component);
	
	RenderStoreProvider.childContextTypes = {
	  linkedRenderStore: _react.PropTypes.object
	};
	
	exports.default = RenderStoreProvider;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=link-react.js.map