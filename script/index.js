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
            var scripts = document.querySelectorAll('script');
            if(scripts.length >= 1){
                body.removeChild(scripts[0]);
            }
            var script = document.createElement('script');
//                script.src = 'http://suggestion.baidu.com/su?wd=我&cb=search';
            script.src = 'https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd='+ val +'&cb=insert';
            body.appendChild(script);

            oldVal = val;
        }, false);

        function insert (json) {
            for (var i = 0; i < json.s.length; i++) {
                var li = document.createElement('li');
                li.innerHTML = json['s'][i];
                ul.appendChild(li);
            }
            console.log(json);
        }
        window.insert = insert;
    }
})(window);