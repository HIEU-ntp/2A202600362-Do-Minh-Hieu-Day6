import json
from typing import List, Dict, Any, Optional

class VinFastRecommendationEngine:
    def __init__(self, data_file: str = 'recommendation.json'):
        """Load vehicle data from JSON file"""
        with open(data_file, 'r', encoding='utf-8') as f:
            self.data = json.load(f)
        self.vehicles = self.data['vehicles']
    
    def filter_by_budget(self, vehicles: List[Dict], max_budget_million: int) -> List[Dict]:
        """Filter vehicles within budget (in millions VND)"""
        return [v for v in vehicles if v['price_million'] <= max_budget_million]
    
    def filter_by_seats(self, vehicles: List[Dict], min_seats: int) -> List[Dict]:
        """Filter vehicles by minimum seats"""
        return [v for v in vehicles if v['seats'] >= min_seats]
    
    def filter_by_type(self, vehicles: List[Dict], vehicle_type: str) -> List[Dict]:
        """Filter vehicles by type (car or motobike)"""
        return [v for v in vehicles if v['type'].lower() == vehicle_type.lower()]
    
    def filter_by_demand(self, vehicles: List[Dict], demand: str) -> List[Dict]:
        """
        Filter vehicles by demand type:
        - 'economy': cheap, fuel-efficient
        - 'comfort': luxury features, good range
        - 'family': many seats, spacious
        - 'performance': high power
        - 'eco': good range
        """
        demand = demand.lower()
        
        if demand == 'economy':
            return [v for v in vehicles if v['price_million'] < 100]
        
        elif demand == 'comfort':
            comfort_vehicles = [v for v in vehicles if any(pro in str(v.get('pros', '')) for pro in ['Trang bị', 'sang trọng', 'cao cấp'])]
            return comfort_vehicles if comfort_vehicles else vehicles
        
        elif demand == 'family':
            return [v for v in vehicles if v['seats'] >= 6]
        
        elif demand == 'performance':
            return [v for v in vehicles if v.get('motor_power_hp', 0) > 30]
        
        elif demand == 'eco':
            return [v for v in vehicles if v.get('range_km', 0) >= 150]
        
        return vehicles
    
    def calculate_score(self, vehicle: Dict, 
                       budget_million: int, 
                       min_seats: int,
                       demand: str = 'balanced',
                       priority: Optional[Dict[str, float]] = None) -> float:
        """
        Calculate vehicle score based on criteria and priority weights
        
        priority keys: 'price', 'comfort', 'performance', 'efficiency', 'range'
        """
        if priority is None:
            priority = {
                'price': 0.25,
                'comfort': 0.20,
                'performance': 0.20,
                'efficiency': 0.15,
                'range': 0.20
            }
        
        score = 0.0
        
        # Price score (lower is better)
        price_ratio = vehicle['price_million'] / budget_million
        price_score = max(0, 100 - price_ratio * 100)
        score += price_score * priority.get('price', 0.25)
        
        # Comfort score - based on features list
        comfort_score = len(vehicle.get('features', [])) * 10  # 10 points per feature
        comfort_score = min(100, comfort_score)
        score += comfort_score * priority.get('comfort', 0.20)
        
        # Performance score
        power = vehicle.get('motor_power_hp', 0)
        perf_score = (power / 70) * 100  # Normalize to 100 (max ~70 hp)
        perf_score = min(100, perf_score)
        score += perf_score * priority.get('performance', 0.20)
        
        # Range/Efficiency score
        range_km = vehicle.get('range_km', 0)
        if range_km > 0:
            efficiency_score = (range_km / 350) * 100  # Normalize to best range
        else:
            # For vehicles without range, use monthly cost as proxy
            monthly_cost = vehicle.get('monthly_charging_cost_vnd', 1000000)
            efficiency_score = max(0, 100 - (monthly_cost / 2000000) * 100)
        efficiency_score = min(100, efficiency_score)
        score += efficiency_score * priority.get('range', priority.get('efficiency', 0.20))
        
        # Seat requirement bonus
        if vehicle['seats'] >= min_seats:
            score += 10
        elif vehicle['type'] == 'motobike':
            score -= 5
        else:
            score -= 15
        
        # Pros/cons evaluation
        pros_count = len(vehicle.get('pros', []))
        cons_count = len(vehicle.get('cons', []))
        score += pros_count * 2
        score -= cons_count * 1
        
        return round(score, 0)
    
    def get_recommendations(self,
                           budget_million: int,
                           seats: int,
                           vehicle_type: str = 'all',
                           demand: str = 'balanced',
                           priority: Optional[Dict[str, float]] = None,
                           top_n: int = 3) -> Dict[str, Any]:
        """
        Get top N vehicle recommendations
        
        Args:
            budget_million: Maximum budget in millions VND
            seats: Minimum number of seats
            vehicle_type: Type of vehicle ('car', 'motobike', 'all')
            demand: Type of demand (economy, comfort, family, performance, eco, balanced)
            priority: Weight dictionary for scoring
            top_n: Number of recommendations to return
        
        Returns:
            Dictionary with 'top3' key containing list of recommendations with details
        """
        candidates = self.vehicles.copy()
        
        # Apply filters
        candidates = self.filter_by_budget(candidates, budget_million)
        candidates = self.filter_by_seats(candidates, seats)
        
        if vehicle_type.lower() != 'all':
            candidates = self.filter_by_type(candidates, vehicle_type)
        
        if demand != 'balanced':
            candidates = self.filter_by_demand(candidates, demand)
        
        # Calculate scores
        scored = []
        for vehicle in candidates:
            score = self.calculate_score(vehicle, budget_million, seats, demand, priority)
            scored.append({
                'model': vehicle['model'],
                'variant': vehicle.get('variant', ''),
                'price_million': vehicle['price_million'],
                'type': vehicle['type'],
                'segments': vehicle.get('segment', ''),
                'range_km': vehicle.get('range_km', 0),
                'seats': vehicle['seats'],
                'colors': vehicle.get('color', []),
                'score': int(score)
            })
        
        # Sort by score and return top N
        scored.sort(key=lambda x: x['score'], reverse=True)
        
        return {
            'top3': scored[:top_n],
            'total_candidates': len(scored)
        }
    
    def get_vehicle_details(self, model: str) -> Optional[Dict]:
        """Get detailed information about a specific vehicle"""
        for vehicle in self.vehicles:
            if vehicle['model'].lower() == model.lower():
                return vehicle
        return None


# Test cases
if __name__ == '__main__':
    engine = VinFastRecommendationEngine()
    
    print("=" * 70)
    print("VINFAST CAR & MOTORBIKE SUGGESTION ENGINE")
    print("=" * 70)
    
    # Test 1: Budget buyer, 5 seats car, economy
    print("\n[Test 1] Budget: 1500M VND | Seats: 5 | Type: Car | Demand: Economy")
    result = engine.get_recommendations(
        budget_million=1500,
        seats=5,
        vehicle_type='car',
        demand='economy'
    )
    print(f"Found {result['total_candidates']} candidates, Top 3 recommendations:")
    for i, rec in enumerate(result['top3'], 1):
        print(f"  {i}. {rec['model']} {rec['variant']} - {rec['price_million']}M VND | {rec['range_km']}km | Score: {rec['score']}")
    
    # Test 2: Family needs, 7 seats
    print("\n[Test 2] Budget: 2500M VND | Seats: 7 | Type: Car | Demand: Family")
    result = engine.get_recommendations(
        budget_million=2500,
        seats=7,
        vehicle_type='car',
        demand='family'
    )
    print(f"Found {result['total_candidates']} candidates, Top 3 recommendations:")
    for i, rec in enumerate(result['top3'], 1):
        print(f"  {i}. {rec['model']} {rec['variant']} - {rec['price_million']}M VND | {rec['seats']} seats | Score: {rec['score']}")
    
    # Test 3: Premium comfort car
    print("\n[Test 3] Budget: 3000M VND | Seats: 5 | Type: Car | Demand: Comfort")
    result = engine.get_recommendations(
        budget_million=3000,
        seats=5,
        vehicle_type='car',
        demand='comfort'
    )
    print(f"Found {result['total_candidates']} candidates, Top 3 recommendations:")
    for i, rec in enumerate(result['top3'], 1):
        print(f"  {i}. {rec['model']} {rec['variant']} - {rec['price_million']}M VND | Colors: {', '.join(rec['colors'][:3])} | Score: {rec['score']}")
    
    # Test 4: Motorbike - Budget conscious
    print("\n[Test 4] Budget: 50M VND | Seats: 1 | Type: Motobike | Demand: Economy")
    result = engine.get_recommendations(
        budget_million=50,
        seats=1,
        vehicle_type='motobike',
        demand='economy'
    )
    print(f"Found {result['total_candidates']} candidates, Top 3 recommendations:")
    for i, rec in enumerate(result['top3'], 1):
        print(f"  {i}. {rec['model']} - {rec['price_million']}M VND | {rec['range_km']}km range | Score: {rec['score']}")
    
    # Test 5: Motorbike - Performance
    print("\n[Test 5] Budget: 100M VND | Seats: 1 | Type: Motobike | Demand: Performance")
    result = engine.get_recommendations(
        budget_million=100,
        seats=1,
        vehicle_type='motobike',
        demand='performance'
    )
    print(f"Found {result['total_candidates']} candidates, Top 3 recommendations:")
    for i, rec in enumerate(result['top3'], 1):
        print(f"  {i}. {rec['model']} - {rec['price_million']}M VND | Score: {rec['score']}")
    
    # Test 6: All vehicles, limited budget, balanced demand
    print("\n[Test 6] Budget: 800M VND | Seats: 2 | Type: All | Demand: Balanced")
    result = engine.get_recommendations(
        budget_million=800,
        seats=2,
        vehicle_type='all',
        demand='balanced'
    )
    print(f"Found {result['total_candidates']} candidates, Top 3 recommendations:")
    for i, rec in enumerate(result['top3'], 1):
        print(f"  {i}. {rec['model']} ({rec['type']}) - {rec['price_million']}M VND | Score: {rec['score']}")
    
    # Test 7: Get vehicle details
    print("\n[Test 7] Get detailed information about specific vehicle")
    details = engine.get_vehicle_details('VF 3')
    if details:
        print(f"Model: {details['model']}")
        print(f"Price: {details['price_million']}M VND")
        print(f"Type: {details['type']}")
        print(f"Range: {details.get('range_km', 'N/A')}km")
        print(f"Seats: {details['seats']}")
        print(f"Colors: {', '.join(details.get('color', []))}")
        print(f"Features: {', '.join(details.get('features', [])[:3])}")
    else:
        print("Vehicle not found")
    
    print("\n" + "=" * 70)
