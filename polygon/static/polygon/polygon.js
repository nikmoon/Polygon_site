
document.addEventListener('DOMContentLoaded', function(event) {

    // находим необходимые элементы DOM
    var canvas = document.getElementById('polygon');
    var ctx = canvas.getContext('2d');
    var ptCountRange = document.getElementById('ptCountRange');
    var ptCount = document.getElementById('ptCount');
    var btnGetPolygon = document.getElementById('getPolygon');

    // функция отрисовки полигона на канве
    function draw_polygon(points) {
        var ptRadius = 2.0;
        var i;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#AA4466';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for(i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        ctx.fill();

        for(i = 0; i < points.length; i++) {
            ctx.beginPath();
            ctx.arc(points[i].x, points[i].y, ptRadius, 0.0, Math.PI * 2.0, false);
            ctx.closePath();
            ctx.stroke();
        }
    };

    // обработка нажатия кнопки мыши на канве
    function on_canvas_click(ev) {
        var box = canvas.getBoundingClientRect();
        var x = ev.pageX - (box.left + document.body.scrollLeft);
        var y = ev.pageY - (box.top + document.body.scrollTop);

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    alert(xhr.responseText);
                }
            }
        }

        xhr.open('GET', '/polygon/check_point?x=' + x + '&y=' + y, true);
        xhr.send();
    }

    // задаем обработчики для элементов ввода, задающих количество отрисовываемых точек
    ptCountRange.oninput = function() {
        ptCount.value = ptCountRange.value;
    };

    ptCount.onchange = function() {
        ptCountRange.value = ptCount.value;
        ptCount.value = ptCountRange.value;
    };

    // нажали на кнопку "Сформировать новый полигон"
    btnGetPolygon.onclick = function () {
        var points;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState ==4) {
                if (xhr.status == 200) {
                    points = JSON.parse(xhr.responseText)['points'];    // извлекаем данные о точках полигона
                    draw_polygon(points);       // отрисовываем полигон
                    canvas.onclick = on_canvas_click;   // разрешаем и задаем обработчик onclick для канвы
                }
            }
        };

        xhr.open('GET', '/polygon/make_new?ptCount=' + ptCount.value + '&width=' + canvas.width + '&height=' + canvas.height, true);

        // запрещаем кеширование ответа
	    xhr.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");

	    xhr.send();
    };

});