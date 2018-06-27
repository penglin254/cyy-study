var obj = {};
Object.defineProperty(obj, 'test', {
    set: function (newVal) {
        document.getElementById('input_1').value = newVal;
        document.getElementById('span_1').innerHTML = newVal;
    }
});

document.addEventListener('keyup', function (e) {
    obj.test = e.target.value;
});