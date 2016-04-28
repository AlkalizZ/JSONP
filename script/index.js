/**
 * Created by Alkali on 16/3/8.
 */
;(function(){
    window.onload = function(){
        var input = document.getElementById('input'),
            body = document.getElementsByTagName('body')[0],
            ul = document.getElementById('ul');

        //监听input事件
        input.addEventListener('input', function(){
            var val = encodeURI(input.value);
            ul.innerHTML = '';//清空上一次请求所插入的li
            jsonp({
                url: 'https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd='+ val + '&cb=',
                time: 3000,
                callback: function(json){
                    var htmlText = '';
                    for(var i = 0; i < json.s.length; i++){
                        htmlText += '<li>' + json['s'][i] + '</li>';
                    }
                    ul.innerHTML = htmlText;
                },
                fail: function (mes) {
                    alert(mes);
                }
            });
        });

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