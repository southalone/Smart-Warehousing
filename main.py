#!/usr/bin/env python3
"""
Command-line interface for the library.
"""
#前端最后把code转成对应的零件名字
#第一步是判断模式，是放置还是路径规划模式
from place import *
from Dijkstra import * 
import time

def voice(content):
    return None

def main():
    #这一步是获取前端信息，获取mode等信息，如果是放置，要获取货物的编号信息，如果是路径规划，要获取目的地位置数组
    info = {'mode':'place','code':'A'}
    if info['mode'] == 'place':
        #这里必须都通过
        flag1 = capture_and_process('classification',info['code'])
        flag2 = capture_and_process('defect_detect')
        if flag1 and flag2:
            #voice('检测没有问题')
            time.sleep(1)
            magnet(1)
            time.sleep(5)
            action_sequence = get_path(['A',info['code']])
            move(action_sequence)
            rail(1)#直接用
            magnet(0)
            time.sleep(5)
            rail(0)
            action_sequence = get_path([info['code'],'A'])
            move(action_sequence)
        '''
        elif flag1 == False:
            voice('种类错误')
        elif flag2 == False:
            voice('质量不好')
        '''
    elif info['mode'] == 'path_planning':
        time.sleep(1)
        time.sleep(5)
        action_sequence = get_path(info['target'])
        move(action_sequence)
        time.sleep(5)
        action_sequence = get_path([info['target'][-1],'A'])
        move(action_sequence)
if __name__ == '__main__':
    main()