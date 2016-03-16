# JSONP调用百度联想搜索API
---
很久以前就写好的一个小demo,最近又拿出来整理、修改了一下
<!--more-->
## 找到百度的API
首先得找到百度的API，我们假定去百度搜索我的域名`alkalixin`，得到如下页面

![](http://demo.alkalixin.cn/jsonp/baidu1.png "Title")

可以在控制台的Network里看到这么一个信息

![](http://demo.alkalixin.cn/jsonp/baidu2.png "Title")

从中提取出请求地址，缩减掉这里我们不需要的参数，这样我们就得到以下API：

> https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd=alkalixi&cb=jQuery1102039187157806009054_1457413554466

这里的`wd`就是我们请求的关键字，`cb`即回调函数。

## 调用API实现联想搜索
首先先讲一下JSONP的原理，即本地动态的创建`<script>`标签，地址指向第三方API，并允许用户传递一个callback参数给服务端，然后服务端返回数据时会将这个callback参数作为函数名来包裹住JSON数据，这样客户端就可以随意定制自己的函数来自动处理返回数据了。

我们再来看看刚刚搜的`alkalixin`的preview

![](http://demo.alkalixin.cn/jsonp/baidu3.png "Title")

可以看到我们所需数据存放在`json.s`里

根据以上原理，我们可以先写个雏形

```
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
上面的代码已经可以实现了联想搜索，不过还有一定的瑕疵。我们还需要针对中文将input里的值在请求之前进行转义。

```
var val = encodeURI(input.value);//将value进行转义之后再进行请求
```
这里使用的encodeURI()是Javascript中真正用来对URL编码的函数。使用方法大致如下：

```
encodeURI('我');//"%E6%88%91"
decodeURI('%E6%88%91');//"我"
```

再有，我们绑定的是input框的keyup事件，但是有很多keyup触发的时候我们并不希望或者并不需要触发insert函数，所以我们可以对input的value值进行对比，如果值没有发生改变则不必进行之后的一系列操作。

```
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
下面是全部js代码：

```
;(function(){
	window.onload = function(){
    	var input = document.getElementById('input'),
            body = document.getElementsByTagName('body')[0],
            ul = document.getElementById('ul');
        var oldVal;//定义一个存放旧value的变量
        input.addEventListener('keyup', function(){
			var val = encodeURI(input.value);//将value进行转义之后再进行请求
			if(val == oldVal) return;//如果新旧value相等则返回
            ul.innerHTML = '';//清空上一次请求所插入的li
            var scripts = document.querySelectorAll('script');
            if(scripts.length >= 1){
            	body.removeChild(scripts[0]);//每次更新新的script之前，移除旧的标签
            }
            var script = document.createElement('script');
            script.src = 'https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd='+ val +'&cb=insert';
            body.appendChild(script);
            oldVal = val;//标签添加结束之后再把获取到的值存进oldVal里，等待下一次比较
		}, false);

        function insert (json) {
        	//依次插入json中的数据
        	for (var i = 0; i < json.s.length; i++) {
            	var li = document.createElement('li');
                li.innerHTML = json['s'][i];
                ul.appendChild(li);
        	}
        }
		window.insert = insert;//将insert函数写为window的insert方法
	}
})(window);
```
注意上面的`window.insert = insert;`因为我用立即执行函数包裹住了所有的代码，使得insert函数没有暴露在全局作用域里，而jsonp只在window下调用callback函数，所以需要将insert写为window的方法，大概就是这样→_→

说了这么多，是时候放出没有任何css样式的[demo](http://demo.alkalixin.cn/jsonp)了，外貌协会请轻喷。。