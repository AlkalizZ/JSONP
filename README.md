
很久以前就写好的一个小demo,最近又拿出来整理、修改了一下

## 找到百度的API
首先得找到百度的API，我们假定去百度搜索我的名字`Alkali`(这不叫阿卡丽！不信[看这里](http://fanyi.baidu.com/?aldtype=16047#en/zh/alkali)），然后得到如下页面

![](http://demo.alkalixin.cn/jsonp_imgs/baidu1.png "Title")

可以在控制台的Network里看到这么一个信息

![](http://demo.alkalixin.cn/jsonp_imgs/baidu2.png "Title")

从中提取出请求地址，掐头去尾缩减掉我们不需要的参数，这样我们就得到以下API：

> https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd=Alkali&cb=jQuery1102039187157806009054_1457413554466

这里的`wd`就是我们请求的关键字，`cb`即回调函数。

## 调用API实现联想搜索
首先先讲一下JSONP的原理，即本地动态的创建`<script>`标签，地址指向第三方API，并允许用户传递一个callback参数给服务端，然后服务端返回数据时会将这个callback参数作为函数名来包裹住JSON数据，这样客户端就可以随意定制自己的函数来自动处理返回数据了。

我们再来看看刚刚搜的`Alkali`的preview

![](http://demo.alkalixin.cn/jsonp_imgs/baidu3.png "Title")

可以看到我们所需数据存放在`json.s`里

根据以上原理，我们可以先写个雏形

```javascript
input.addEventListener('keyup', function(){
    ul.innerHTML = '';//清空上一次请求所插入的li
    var scripts = document.querySelectorAll('script');
    if(scripts.length >= 1){
        body.removeChild(scripts[0]);//每次更新新的script之前，移除旧的标签
    }
    var script = document.createElement('script');
    script.src = 'https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd='+ input.value +'&cb=insert';
    body.appendChild(script);
}, false);

function insert (json) {
    //依次插入json中的数据
    for (var i = 0; i < json.s.length; i++) {
        var li = document.createElement('li');
        li.innerHTML = json['s'][i];
        ul.appendChild(li);
    }
}
```
上面的代码已经可以实现了联想搜索，不过还有一定的瑕疵。可以看到我使用的是循环插入dom，这样在需要大量操作dom时，性能上就会不尽人意。~~不过这里为了方便我就先这么写了→_→~~。可以使用innerHtml的方法来添加:

```javascript
var htmlText = '';
for(var i = 0; i < json.s.length; i++){
    htmlText += '<li>' + json['s'][i] + '</li>';
}
ul.innerHTML = htmlText;
```

除此之外我们还需要针对中文将input里的值在请求之前进行转义。

```javascript
var val = encodeURI(input.value);//将value进行转义之后再进行请求
```
这里使用的encodeURI()是Javascript中真正用来对URL编码的函数。使用方法大致如下：

```javascript
encodeURI('我');//"%E6%88%91"
decodeURI('%E6%88%91');//"我"
```

再有，我们绑定的是input框的 `keyup` 事件，但是有很多keyup触发的时候我们并不希望或者并不需要触发insert函数，所以我们可以对input的value值进行对比，如果值没有发生改变则不必进行之后的一系列操作。

```javascript
var oldVal;//定义一个存放旧value的变量
input.addEventListener('keyup', function(){
    var val = encodeURI(input.value);//将value进行转义之后再进行请求
    if(val == oldVal) return;//如果新旧value相等则返回
    ul.innerHTML = ''; 
  
    ...
   
    body.appendChild(script);
    oldVal = val;//标签添加结束之后再把获取到的值存进oldVal里，等待下一次比较
}, false);
```

想要简单点的话也可以绑定 `input` 事件：

```javascript
input.addEventListener('input', function(){
    var val = encodeURI(input.value);//将value进行转义之后再进行请求
    ul.innerHTML = ''; 
  
    ...
   
    body.appendChild(script);
}, false);
```
为了使用方便，封装成函数是最好不过的选择：

```javascript
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

	//将回调写为window的方法
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
```

下面是我最后使用的js代码：

```javascript
;(function(){
    window.onload = function(){
        var input = document.getElementById('input'),
            body = document.getElementsByTagName('body')[0],
            ul = document.getElementById('ul');
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
```
注意上面的`window[callbackName] = function(){};`因为我用立即执行函数包裹住了所有的代码，使得回调函数没有暴露在全局作用域里，而jsonp只在window下调用callback函数，所以需要将jsonp函数里的回调函数写为window的方法，大概就是这样😑

说了这么多，是时候放出没有任何css样式的[demo](https://www.alkalixin.cn/demo/jsonp/)了，外貌协会请轻喷。。