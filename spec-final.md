SPEC — AI Product Hackathon

Nhóm: Nhóm 1 Zone 3
Track: ☑ VinFast · ☐ Vinmec · ☐ VinUni-VinSchool · ☐ XanhSM · ☐ Open

Problem statement (1 câu): Khách hàng muốn mua xe điện VinFast nhưng phải đọc nhiều thông tin rời rạc (giá, tầm hoạt động, số chỗ, chi phí trả góp), nên AI advisor thu thập nhu cầu tự nhiên và gợi ý top 3 xe + ước tính chi phí để ra quyết định nhanh hơn.

1. AI Product Canvas

Value | Trust | Feasibility
---|---|---
User nào? Pain gì? AI giải gì? | Khi AI sai thì sao? User sửa bằng cách nào? | Cost/latency bao nhiêu? Risk chính?
Người dùng đang cân nhắc mua xe VinFast (đặc biệt người mua lần đầu) khó tự map nhu cầu sang model phù hợp. AI hỏi intake (ngân sách, gia đình, usage, km/tháng, ưu tiên), gọi tool recommend để trả top 3 và lý do, sau đó tool calculator để ước tính chi phí 5 năm. | AI không tự quyết định; user luôn thấy danh sách xe, có thể chọn xe khác ở Top 3, đổi tham số trả góp, hoặc bỏ qua AI để đi flow câu hỏi cố định. Nếu thấy sai, user chỉnh lại input và chạy lại ngay. | Model chat dùng OpenAI (mặc định gpt-4o-mini) + tool nội bộ từ dữ liệu JSON. Latency mục tiêu: 2-6s/lượt chat có tool. Chi phí inference thấp cho demo (<$0.02/lượt). Risk chính: hallucinate thông số/giá và mismatch ngân sách nếu không ép tool.

Automation hay augmentation? ☐ Automation · ☑ Augmentation
Justify: AI chỉ tư vấn và giải thích; quyền quyết định vẫn ở khách hàng + nhân viên showroom.

Learning signal:

- User correction đi vào đâu?
	- Lần demo hiện tại: correction được phản ánh trực tiếp qua việc user đổi câu trả lời intake/chọn xe khác/chỉnh calculator.
	- Lead form lưu localStorage (web) và có mock JSONL (backend Python) để team phân tích nhu cầu thực tế và câu hỏi hay gặp.
- Product thu signal gì để biết tốt lên hay tệ đi?
	- Tỷ lệ chat đi tới bước có Top 3.
	- Tỷ lệ user bấm/chọn xe trong Top 3.
	- Tỷ lệ mở calculator và hoàn tất lead.
	- Tỷ lệ user yêu cầu “gặp nhân viên” sau tư vấn AI.
	- Tỷ lệ lỗi do tool/API (không gọi được recommend/calculate).
- Data thuộc loại nào?
	- ☑ User-specific (profile nhu cầu từng phiên)
	- ☑ Domain-specific (catalog xe VinFast, pricing, range, features)
	- ☑ Real-time (đối thoại theo ngữ cảnh)
	- ☑ Human-judgment (user chọn/không chọn đề xuất, chỉnh input)
	- ☑ Khác: conversion signal (lead/test drive intent)
	- Marginal value: có, vì phản hồi thực tế của khách Việt theo ngân sách/usage cụ thể không có đầy đủ trong pretraining model.

2. User Stories — 4 paths

Feature 1: Tư vấn xe Top 3 bằng AI Agent + tool

Trigger: User vào tab Compass, nhập nhu cầu tự nhiên (ví dụ “tôi có 700 triệu, gia đình 5 người, đi 1200 km/tháng”).

Path | Câu hỏi thiết kế | Mô tả
---|---|---
Happy — AI đúng, tự tin | User thấy gì? Flow kết thúc ra sao? | AI gọi recommend_vehicle, trả Top 3 đúng ngân sách, có lý do từng xe. User chọn 1 xe để xem calculator hoặc tiếp tục so sánh.
Low-confidence — AI không chắc | System báo “không chắc” bằng cách nào? User quyết thế nào? | Khi thiếu dữ liệu (đặc biệt ngân sách), agent không nêu xe cụ thể mà hỏi thêm intake. User trả lời bổ sung rồi AI mới recommend.
Failure — AI sai | User biết AI sai bằng cách nào? Recover ra sao? | Nếu AI trả lời mơ hồ/sai kỳ vọng, user có thể chuyển sang “Câu hỏi cố định” để đi flow deterministic 5 bước và chạy lại recommend.
Correction — user sửa | User sửa bằng cách nào? Data đó đi vào đâu? | User chỉnh trực tiếp budget/family/priority trong chat; hệ thống recompute Top 3 ngay từ catalog hiện có. Tín hiệu chỉnh sửa được phản ánh trong lịch sử chat và có thể dùng cho phân tích sau demo.

Feature 2: Calculator chi phí sở hữu 5 năm

Trigger: User đã chọn một xe trong Top 3 và muốn biết khả năng tài chính.

Path | Câu hỏi thiết kế | Mô tả
---|---|---
Happy — AI đúng, tự tin | User thấy gì? Flow kết thúc ra sao? | Tool calculate_cost trả trả trước, khoản vay, trả góp tháng, chi phí sạc, tổng 5 năm. User thấy affordability rõ hơn.
Low-confidence — AI không chắc | System báo ra sao? | Nếu không có vehicle_id hợp lệ hoặc API lỗi, system fallback sang JS calculator cùng công thức, tránh mất flow.
Failure — AI sai | User biết AI sai bằng cách nào? Recover ra sao? | Sai lệch do user nhập tenure/rate bất thường → số tiền “lạ”. User chỉnh lại down payment, lãi suất, kỳ hạn để kiểm tra kịch bản mới.
Correction — user sửa | Data đó đi vào đâu? | Mỗi lần chỉnh slider/input là một correction implicit về mức chịu chi; dữ liệu có thể log để tinh chỉnh gợi ý tài chính sau này.

Feature 3: Lead capture (book test drive / tư vấn thêm)

Trigger: User có xe ưu tiên và muốn được nhân viên liên hệ.

Path | Câu hỏi thiết kế | Mô tả
---|---|---
Happy — AI đúng, tự tin | Flow kết thúc ra sao? | User điền tên + phone/email + nhu cầu + tick lái thử, hệ thống lưu lead thành công.
Low-confidence — AI không chắc | User quyết thế nào? | Nếu user chưa chọn xe, form báo cần chọn xe Top 3 trước để đảm bảo lead có ngữ cảnh.
Failure — AI sai | Recover ra sao? | Nếu thiếu field bắt buộc (name, phone/email), validate báo lỗi rõ ràng và giữ nguyên dữ liệu để user sửa.
Correction — user sửa | Data đó đi vào đâu? | User cập nhật thông tin liên hệ và gửi lại; lead mới được lưu localStorage (web demo) hoặc JSONL (mock backend) cho đội sales follow-up.

3. Eval metrics + threshold

Optimize precision hay recall? ☑ Precision · ☐ Recall

Tại sao: Với tư vấn mua xe, đề xuất sai nhưng “nói chắc” làm mất niềm tin nhanh. Precision cao ở Top 3 quan trọng hơn coverage rộng.

Nếu tối ưu recall quá mức (precision thấp): user thấy nhiều xe “không liên quan”, tốn thời gian lọc và dễ bỏ sản phẩm.

Metric | Threshold | Red flag (dừng khi)
---|---|---
Tool-grounded recommendation precision@3 (xe được user đánh giá “phù hợp”) | ≥75% | <55% trong 2 tuần pilot
Budget compliance rate (xe đề xuất ≤ ngân sách user) | 100% | <98% bất kỳ tuần nào
Lead conversion rate (session có Top3 → submit lead) | ≥18% | <8% sau 300 session
Median latency chat có tool | ≤6 giây | >10 giây trong 3 ngày liên tiếp
Hallucination incident rate (nói thông số không có trong data/tool) | 0 incident nghiêm trọng | >0 incident nghiêm trọng

4. Top 3 failure modes

Liệt kê cách product có thể fail — không phải list features.

# | Trigger | Hậu quả | Mitigation
---|---|---|---
1 | User nhập ngân sách mơ hồ ("khoảng 1 tỷ hơn", "tài chính linh hoạt") hoặc parser hiểu sai đơn vị | Gợi ý vượt khả năng chi trả, giảm trust ngay vòng đầu | Bắt buộc xác nhận lại budget chuẩn hóa về triệu VND trước khi chốt Top 3; hard check mọi xe phải ≤ budget.
2 | Dữ liệu giá/catalog cũ so với showroom thực tế | User kỳ vọng sai về giá, bức xúc khi được báo giá thật | Luôn hiển thị disclaimer giá tham khảo; thêm ngày cập nhật dataset; khuyến nghị gặp tư vấn viên trước quyết định.
3 | Hallucination trong câu trả lời tự do của LLM (nêu xe/spec không có trong tool result) — user khó tự phát hiện ngay | User tin thông tin sai, rủi ro ra quyết định sai (failure mode nguy hiểm nhất vì có thể không tự phát hiện) | Prompt rule: chỉ được nói từ tool output; ép gọi tool trước khi recommend; chặn tên xe ngoài top3; fallback sang flow câu hỏi cố định khi bất thường.

5. ROI 3 kịch bản

Giả định chung:
- 1 tư vấn viên tốn ~15 phút/khách cho bước pre-qualification.
- AI giảm còn ~5 phút phần thủ công đầu vào, tiết kiệm ~10 phút/lead đủ điều kiện.
- Cost hạ tầng chủ yếu gồm LLM calls + hosting web/API nhẹ.

Chỉ số | Conservative | Realistic | Optimistic
---|---|---|---
Assumption | 120 session/ngày, 45% tới Top3, 10% để lại lead | 500 session/ngày, 60% tới Top3, 18% lead | 2000 session/ngày, 70% tới Top3, 25% lead
Cost | ~$18/ngày | ~$70/ngày | ~$260/ngày
Benefit | Tiết kiệm ~20 giờ công pre-sales/tháng + tăng chất lượng lead đầu vào | Tiết kiệm ~120 giờ/tháng + tăng lead qualified cho showroom | Tiết kiệm ~600 giờ/tháng + tăng đáng kể conversion test drive
Net | Dương nhẹ (thích hợp pilot) | Dương rõ rệt, nên mở rộng | Dương mạnh nếu giữ được quality & latency

Kill criteria:
- Cost > benefit trong 2 tháng liên tiếp dù đã tối ưu prompt/tool.
- Hallucination nghiêm trọng lặp lại >3 lần/tháng.
- Lead conversion không đạt 8% sau khi có đủ 500 phiên hợp lệ.

6. Mini AI spec (1 trang)

Sản phẩm là một AI Advisor cho VinFast đặt trong giao diện mobile web prototype. Mục tiêu của sản phẩm là giảm ma sát ở giai đoạn đầu phễu mua xe: khách hàng thường biết “mức tiền có thể chi” nhưng không biết model nào hợp với gia đình, nhu cầu đi lại, và tổng chi phí sở hữu. Hệ thống sử dụng cơ chế augmentation: AI không tự chốt thay khách mà hỏi intake, gợi ý top 3 xe, giải thích lý do, tính chi phí và mời khách để lại lead/gặp nhân viên.

Kiến trúc gồm frontend React (chat + recommendation + calculator + lead form), bộ dữ liệu xe từ JSON, và lớp tool runtime cho AI gồm recommend_vehicle, calculate_cost, compare_vehicles. Khi có backend Python API thì tool gọi server; nếu không thì fallback JS cục bộ để đảm bảo demo vẫn chạy. Điều này giúp sản phẩm có độ bền vận hành tốt hơn trong môi trường hackathon.

Chất lượng được ưu tiên theo precision: đề xuất phải đúng ngân sách và hợp nhu cầu hơn là đưa nhiều lựa chọn. Các guardrail chính gồm: bắt buộc xác nhận ngân sách, chỉ phát ngôn thông số từ kết quả tool, luôn hiển thị disclaimer giá, và cho phép user quay lại flow câu hỏi cố định nếu AI free-chat không ổn định.

Rủi ro lớn nhất là hallucination và sai lệch dữ liệu giá theo thời gian. Rủi ro này được giảm bằng grounded tool-call + rule trong system prompt + cơ chế fallback deterministic. Data flywheel đến từ hành vi thật của người dùng: cách họ sửa intake, xe họ chọn trong Top 3, tham số tài chính họ điều chỉnh, và lead họ để lại. Qua mỗi vòng pilot, đội ngũ có thể tinh chỉnh parser, trọng số recommend, và ngữ cảnh hỏi đáp để tăng conversion mà vẫn giữ trust.