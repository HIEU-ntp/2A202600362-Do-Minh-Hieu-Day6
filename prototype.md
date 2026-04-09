# Prototype — VinFast AI Advisor (Compass Delivery)

## Mô tả
Prototype mô phỏng hành trình tư vấn mua xe VinFast trên mobile UI:
- User đăng nhập hoặc vào guest mode.
- Ở tab Compass, chatbot thu thập nhu cầu (ngân sách, số người, mục đích, km/tháng, ưu tiên).
- AI gợi ý Top 3 xe phù hợp từ catalog nội bộ.
- User chọn xe để xem calculator (trả góp + chi phí sạc + tổng 5 năm).
- User để lại lead (phone/email, nhu cầu, chọn lái thử).

## Level
Working prototype (frontend chạy thật + AI/tool chạy thật):
- UI: React + Vite.
- Agent mode: OpenAI Chat Completions + function calling (recommend_vehicle, calculate_cost, compare_vehicles).
- Fixed-question mode: fallback deterministic khi chưa có API key hoặc muốn chạy ổn định không phụ thuộc LLM.
- Data: `data/vehicles.json`.
- Lead store: localStorage (web), có mock backend Python để mở rộng.

## Cách chạy demo
1. Frontend
	- Vào thư mục `Hackathon/Demo`
	- `npm install`
	- `npm run dev`

2. (Tuỳ chọn) bật AI Agent với OpenAI
	- Cấu hình file `.env` trong `Hackathon/Demo`
	- `VITE_OPENAI_API_KEY=...`
	- `VITE_OPENAI_MODEL=gpt-4o-mini` (hoặc model khác)

3. (Tuỳ chọn) bật Python tool API
	- Cài dependencies tại thư mục `server` (`pip install -r requirements.txt`)
	- Chạy FastAPI app (mặc định endpoint `/api/recommend`, `/api/calculate`, `/api/health`)
	- Set `VITE_AGENT_API_URL=http://127.0.0.1:8765`

## Feature đã có trong prototype
- Authentication mock: member/guest session.
- Chat advisor 2 chế độ:
  - AI Agent mode (natural language).
  - Câu hỏi cố định (guided intake).
- Recommendation top 3 theo profile user và ngân sách.
- Cost calculator cho xe đang chọn.
- Lead form có validation bắt buộc.
- Guardrail chống hallucination trong system prompt (chỉ dùng dữ liệu từ tool/result).

## Tech stack
- Frontend: React 18, Vite 5.
- AI inference: OpenAI API (mặc định model `gpt-4o-mini`).
- Backend tools (optional): FastAPI (Python).
- Recommendation engine: Python + bản JS fallback.
- Storage demo: browser localStorage.

## Demo script ngắn
1. Mở app, vào Compass.
2. Nhập: “Mình có 700 triệu, gia đình 5 người, đi 1200 km/tháng, ưu tiên rộng rãi”.
3. Xem Top 3 xe + lý do gợi ý.
4. Chọn 1 xe, chỉnh down payment/lãi suất/kỳ hạn để xem tổng chi phí 5 năm.
5. Điền lead và tick “lái thử”.

## Hạn chế hiện tại
- Chưa tích hợp CRM thật (lead mới dừng ở mock storage).
- Chưa có telemetry dashboard cho metric online.
- Chưa có cơ chế cập nhật giá/catalog tự động theo thời gian thực.

## Định hướng vòng tiếp theo
- Đồng bộ lead về backend/CRM.
- A/B test prompt và thứ tự câu hỏi intake.
- Bổ sung compare view trực quan cho 2-3 xe.
- Thêm analytics pipeline để theo dõi precision@3, conversion và latency theo ngày.