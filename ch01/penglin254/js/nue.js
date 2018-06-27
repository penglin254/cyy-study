/**
 * 构造Nue
 * @param options
 * @constructor
 */
function Nue(options) {
    this._init(options);
}

/**
 * 初始化Nue
 * @param options
 * @private
 */
Nue.prototype._init = function (options) {
        this.$options = options;  //传入的实例配置
    this.$el = document.querySelector(options.el); //实例绑定的根节点
    this.$data = options.data;  //实例的数据域
    this.$methods = options.methods; //实例的函数域
    
    //与DOM绑定的数据对象集合
    //每个成员属性有一个名为_directives的数组，用于在数据更新时触发更新DOM的各directive
    this._binding = {};
    this._parseData(this.$data);
    
    this._compile(this.$el);
};

/**
 * 对象属性重定义
 * @param key
 * @param val
 */
Nue.prototype.convert = function (key, val) {
    var binding = this._binding[key];
    Object.defineProperty(this.$data, key, {
        enumerable  : true,
        configurable: true,
        get         : function () {
            console.log("获取" + val);
            return val;
        },
        set         : function (newVal) {
            console.log("更新" + newVal);
            if (val != newVal) {
                val = newVal;
                binding._directives.forEach(function (item) {
                    item.update();
                });
            }
            
        }
    });
};

/**
 * 遍历数据域，添加getter/setter
 * @param obj
 * @private
 */
Nue.prototype._parseData = function (obj) {
    var value;
    for (var key in obj) {
        //排除原型链上的属性，仅仅遍历对象本身拥有的属性
        if (obj.hasOwnProperty(key)) {
            this._binding[key] = {  //初始化与DOM绑定的数据对象
                _directives: []
            };
            value = obj[key];
            //如果属性值为对象，则递归解析
            if (typeof value === 'object') {
                this._parseData(value);
            }
            this.convert(key, value);
        }
        
    }
};

/**
 * 遍历函数域，对绑定的函数进行改造
 * @param funcList
 * @private
 */
Nue.prototype._parseFunc = function (funcList) {
    var _this = this;
    for (var key in funcList) {
        if (funcList.hasOwnProperty(key)) {
            var func = funcList[key];
            funcList[key] = (function () {
                return function () {
                    func.apply(_this.$data, arguments);
                };
            })();
        }
    }
};

/**
 * 定义指令
 * @param name
 * @param el
 * @param vm
 * @param exp
 * @param attr
 * @constructor
 */
function Directive(name, el, vm, exp, attr) {
    this.name = name;   //指令名称，例如文本节点，该值设为"text"
    this.el = el;       //指令对应的DOM元素
    this.vm = vm;       //指令所属Nue实例
    this.exp = exp;     //指令对应的值，本例如"count"
    this.attr = attr;   //绑定的属性值，本例为"innerHTML"
    
    this.update();  //首次绑定时更新
}

/**
 * 更新DOM节点的预设属性值
 */
Directive.prototype.update = function () {
    this.el[this.attr] = this.vm.$data[this.exp];
};

/**
 * 解析DOM的指令
 * @param root
 * @private
 */
Nue.prototype._compile = function (root) {
    var _this = this, nodes = root.children;
    for (var i = 0; i < nodes.length; i ++) {
        var node = nodes[i];
        //若该元素有子节点，则先递归编译其子节点
        if (node.children.length) {
            this._compile(node);
        }
        
        if (node.hasAttribute("n-click")) {
            node.onclick = (function () {
                var attrVal = nodes[i].getAttribute("n-click");
                var args = /\(.*\)/.exec(attrVal);
                if (args) {
                    args = args[0];
                    attrVal = attrVal.replace(args, "");
                    args = args.replace(/[\(|\)|\'|\"]/g, '').split(",");
                }
                else {
                    args = [];
                }
                return function () {
                    _this.$methods[attrVal].apply(_this.$data, args);
                };
            })();
        }
        
        //如果是input或textarea标签
        if (node.hasAttribute(("n-model")) && node.tagName == "INPUT" || node.tagName == "TEXTAREA") {
            node.addEventListener("input", (function (key) {
                var attrVal = node.getAttribute("n-model");
                
                _this._binding[attrVal]._directives.push(new Directive(
                    "input",
                    node,
                    _this,
                    attrVal,
                    "value"
                ));
                
                return function () {
                    _this.$data[attrVal] = nodes[key].value;
                };
            })(i));
        }
        
        
        if (node.hasAttribute("n-bind")) {
            var attrVal = node.getAttribute("n-bind");
            //将innerHTML的更新指令添加至_directives数组
            _this._binding[attrVal]._directives.push(new Directive(
                "text",
                node,
                _this,
                attrVal,
                "innerHTML"
            ));
        }
    }
};
