/**
 * Created by Alkali on 16/3/8.
 */
;(function(){
    window.onload = function(){
        var input = document.getElementById('input'),
            body = document.getElementsByTagName('body')[0],
            ul = document.getElementById('ul');

        var oldVal = encodeURI(input.value);

        input.addEventListener('keyup', function(){

            var val = encodeURI(input.value);

            if(val == oldVal) return;

            ul.innerHTML = '';
            // script.src = 'http://suggestion.baidu.com/su?wd=我&cb=search';

            jsonp({
                url: 'https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd='+ val + '&cb=',
                time: 3000,
                callback: function(json){
                    var frag = document.createDocumentFragment();
                    for(var i = 0; i < json.s.length; i++){
                        var li = document.createElement('li');
                        li.innerHTML = json['s'][i];
                        frag.appendChild(li);
                    }
                    ul.appendChild(frag);
                },
                fail: function (mes) {
                    alert(mes);
                }
            });

            oldVal = val;
        }, false);

        function jsonp(objects){
            objects = objects || {};
            if(!objects.url || !objects.callback){
                throw new Error('参数不合法');
            }

            //创建script标签并插入
            var callbackName =  ('jsonp_' + Math.random()).replace(".", "");//随机生成callbackName

            var script = document.createElement('script');
            var body = document.getElementsByTagName('body')[0];
            body.appendChild(script);

            window[callbackName] = function (json) {
                body.removeChild(script);
                clearTimeout(script.timer);
                window[callbackName] = null;
                objects.callback && objects.callback(json);
            };

            //发出请求
            script.src = objects.url + callbackName;

            //响应时间
            if(objects.time){
                script.timer = setTimeout(function () {
                    window[callbackName] = null;
                    body.removeChild(script);
                    objects.fail && objects.fail('超时');
                }, objects.time);
            }
        }
    }
})(window);