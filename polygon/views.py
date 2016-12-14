from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.views.generic import View
import math
from random import randrange

# Create your views here.


class NewPolygonView(View):

    def get(self, request):
        ptCount = int(request.GET.get('ptCount', 10))
        width = int(request.GET.get('width', 100))
        height = int(request.GET.get('height', 100))

        # алгоритм формирования точек: угол 360 градусов делится на количество точек. начиная с угла 0
        # на расстоянии от центра, не превышающем границы канвы, берется случайная точка

        maxDist = min(width, height) / 2
        minDist = 15

        points = []

        # угол между прямыми, соединяющими центр с каждой точкой
        angleStep = 2 * math.pi / ptCount

        curAngle = 0
        for i in range(ptCount):
            dist = randrange(minDist, maxDist + 1)
            x = dist * math.cos(curAngle) + width / 2
            y = dist * math.sin(curAngle) + height / 2
            points.append({'x': x, 'y': y})
            curAngle += angleStep

        # сохраняем координаты точек в сессии, чтобы не передавать их каждый раз при проверке попадания
        # точки внутрь полигона
        request.session['points'] = points
        return JsonResponse({'points': points})


class CheckPoint(View):

    @staticmethod
    def point_inside(points, x, y):
        def have_cross(x, y, x1, y1, x2, y2):
            '''Проверка пересечения горизонтального луча из точки x,y с отрезком [(x1,y1), (x2,y2)]'''
            dy = y2 - y1
            if dy == 0:
                return False

            if (y1 <= y) and (y2 <= y):
                return False

            # коэффициент наклона отрезка
            a = dy / (x2 - x1)

            # возможная точка пересечения
            X = (y - y1) / a + x1

            if min(x1, x2) <= X <= max(x1, x2) and X >= x:
                return True

            return False

        ptInside = False
        for i in range(1, len(points)):
            pt1 = points[i-1]
            pt2 = points[i]
            if have_cross(x, y, pt1['x'], pt1['y'], pt2['x'], pt2['y']):
                ptInside = not ptInside
        if have_cross(x, y, points[-1]['x'], points[-1]['y'], points[0]['x'], points[0]['y']):
            ptInside = not ptInside

        return ptInside

    def get(self, request):
        x = float(request.GET.get('x', 0))
        y = float(request.GET.get('y', 0))
        points = request.session.get('points', [])
        if not points:
            return HttpResponse('Произошла неизвестная ошибка, обратитесь к администратору сайта.')
        if self.point_inside(points, x, y):
            return HttpResponse('Поздравляем! Вы попали внутрь полигона!')
        else:
            return HttpResponse('Нам очень жаль... Попробуйте еще раз.')
