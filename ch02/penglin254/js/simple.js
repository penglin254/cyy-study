/**
 * underscore 封装 _
 */
(function () {
    var _ = function (obj) {
        return new wrapper(obj);
    };
    
    _.VERSION = '1.0.0';
    
    
    var wrapper = function (obj) {
        this._wrapped = obj;
    };
    
    // 链式包装函数
    var result = function (obj, chain) {
        return chain ? _(obj).chain() : obj;
    };
    
    // 触发可链式函数
    wrapper.prototype.chain = function () {
        // this._chain用来标示当前对象是否使用链式操作
        this._chain = true;
        return this;
    };
    
    // 当触发可链式后，用这个来取结果值
    wrapper.prototype.value = function () {
        return this._wrapped;
    };
    var ArrayProto = Array.prototype,
        forEach = ArrayProto.forEach;
    
    // 这些数组方法需要包装以下才可以链式调用
    forEach.call(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function (name) {
        var method = ArrayProto[name];
        wrapper.prototype[name] = function () {
            var wrapped = this._wrapped;
            // 调用Array对应的方法并返回结果
            method.apply(wrapped, arguments);
            var length = wrapped.length;
            if ((name == 'shift' || name == 'splice') && length === 0) {
                delete wrapped[0];
            }
            return result(wrapped, this._chain);
        };
    });
    
    
    // 这些数组方法本身可链式调用
    forEach.call(['concat', 'join', 'slice'], function (name) {
        var method = ArrayProto[name];
        wrapper.prototype[name] = function () {
            return result(method.apply(this._wrapped, arguments), this._chain);
        };
    });
    
    window._ = _;
}());