import heapq
from collections import defaultdict
from functools import lru_cache

#上0下1左2右3
adjacency_matrix = {
    # 列1
    'E': {'D': 1,'J': 3},  # E(1,1)只能向下到J(2,1)
    'J': {'E': 2, 'O': 3, 'I': 1},
    'O': {'J': 2, 'N': 1},
    
    # 列2
    'D': {'C': 1, 'E': 0},
    'I': {'J': 0, 'H': 1},
    'N': {'O': 0, 'M': 1},
    
    # 列3
    'C': {'D': 0, 'B': 1},
    'H': {'I': 0, 'G': 1},
    'M': {'L': 1, 'N': 0},

    'B': {'C': 0, 'A': 1},
    'G': {'H': 0, 'F': 1},
    'L': {'M': 0, 'K': 1},

    'A': {'B': 0, 'F': 3},  # A(5,1)是最下端
    'F': {'A': 2, 'G': 0, 'K': 3},
    'K': {'L': 0, 'F': 2}  # K(5,3)是最右端
}


class GraphPathPlanner:
    def __init__(self):
        self.graph = defaultdict(dict)
        self._initialize_graph()
    
    def _initialize_graph(self):
        """初始化图结构"""
        # 添加所有边和权重
        edges = [
            ('A', 'B', 1), ('B', 'C', 1), ('C', 'D', 1), ('D', 'E', 1),
            ('F', 'G', 1), ('G', 'H', 1), ('H', 'I', 1), ('I', 'J', 1),
            ('K', 'L', 1), ('L', 'M', 1), ('M', 'N', 1), ('N', 'O', 1),
            # 跨区域连接
            ('A', 'F', 2), ('F', 'K', 2), ('E', 'J', 1), ('J', 'O', 2)
        ]
        
        for u, v, weight in edges:
            self.add_edge(u, v, weight)
    
    def add_edge(self, u, v, weight):
        """添加无向边"""
        self.graph[u][v] = weight
        self.graph[v][u] = weight
    
    def dijkstra(self, start):
        """Dijkstra算法计算单源最短路径"""
        distances = {node: float('infinity') for node in self.graph}
        distances[start] = 0
        heap = [(0, start)]
        visited = set()
        
        while heap:
            current_distance, current_node = heapq.heappop(heap)
            
            if current_node in visited:
                continue
                
            visited.add(current_node)
            
            for neighbor, weight in self.graph[current_node].items():
                distance = current_distance + weight
                
                if distance < distances[neighbor]:
                    distances[neighbor] = distance
                    heapq.heappush(heap, (distance, neighbor))
        
        return distances
    
    def find_optimal_path(self, start, targets):
        """
        寻找访问所有目标点的最优路径
        参数:
            start: 起始点
            targets: 需要访问的目标点列表
        返回:
            (总距离, 路径列表)
        """
        if not targets:
            return (0, [start])
            
        # 计算所有目标点之间的最短距离
        all_nodes = [start] + targets
        distance_matrix = {}
        
        for node in all_nodes:
            distances = self.dijkstra(node)
            distance_matrix[node] = distances
        
        # 使用动态规划解决旅行商问题(TSP)
        target_set = frozenset(targets)
        
        @lru_cache(maxsize=None)
        def dp(visited, current):
            if visited == target_set:
                return (0, [current])
                
            min_dist = float('infinity')
            best_path = []
            
            for target in target_set - visited:
                dist = distance_matrix[current][target]
                remaining_dist, remaining_path = dp(visited | {target}, target)
                total_dist = dist + remaining_dist
                
                if total_dist < min_dist:
                    min_dist = total_dist
                    best_path = [current] + remaining_path
            
            return (min_dist, best_path)
        
        total_distance, path = dp(frozenset(), start)
        
        # 优化路径，去除连续重复的节点
        optimized_path = []
        for node in path:
            if not optimized_path or node != optimized_path[-1]:
                optimized_path.append(node)
        
        return (total_distance, optimized_path)
    
    def reconstruct_path(self, start, end, distances):
        """重建从start到end的具体路径"""
        path = [end]
        current = end
        
        while current != start:
            for neighbor in self.graph[current]:
                if distances[current] == distances[neighbor] + self.graph[current][neighbor]:
                    path.append(neighbor)
                    current = neighbor
                    break
        
        return path[::-1]
    
    def plan_path(self, targets, start='A'):
        """
        规划路径的主函数
        参数:
            targets: 需要访问的目标点列表，如 ['D', 'E', 'F', 'K', 'O']
            start: 起始点，默认为'A'
        返回:
            {
                'targets': 目标点列表,
                'optimal_path': 最优路径顺序,
                'total_distance': 总距离,
                'detailed_path': 详细路径
            }
        """
        # 查找最优路径顺序
        total_distance, path = self.find_optimal_path(start, targets)
        
        # 获取详细路径
        full_path = []
        for i in range(len(path)-1):
            start_node = path[i]
            end_node = path[i+1]
            distances = self.dijkstra(start_node)
            segment_path = self.reconstruct_path(start_node, end_node, distances)
            full_path.extend(segment_path[:-1])
        full_path.append(path[-1])
        
        return {
            'targets': targets,
            'optimal_path': path,
            'total_distance': total_distance,
            'detailed_path': full_path
        }

def get_action_sequence(path, adjacency_matrix):
    sequence = []
    for i in range(len(path)-1):
        if adjacency_matrix[path[i]][path[i+1]] == 0:
            sequence.append('上')
        elif adjacency_matrix[path[i]][path[i+1]] == 1:
            sequence.append('下')
        elif adjacency_matrix[path[i]][path[i+1]] == 2:
            sequence.append('左')
        elif adjacency_matrix[path[i]][path[i+1]] == 3:
            sequence.append('右')
    return sequence

def get_path(targets1):
    planner = GraphPathPlanner()
    result1 = planner.plan_path(targets1)
    # 使用示例
    action_sequence = get_action_sequence(result1['detailed_path'], adjacency_matrix)
    return action_sequence

    