var obj = {};
Object.defineProperty(obj, 'test', {
    set: function (newVal) {
        document.getElementById('input_1').value = newVal;
        document.getElementById('span_1').innerHTML = newVal;
    }
});

document.addEventListener('keyup', function (e) {
    if (typeof(e.target.value) == "undefined") {
        return;
    }
    // console.log(e.target.value)
    obj.test = e.target.value;
});