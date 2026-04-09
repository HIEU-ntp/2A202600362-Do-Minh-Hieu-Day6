# Individual reflection — Nguyễn Văn A (AI20K001)

## 1. Role
Frontend engineer + conversation flow owner.
Mình phụ trách xây dựng UI cho demo VinFast AI Advisor, thiết kế flow chatbot và làm initial setup để team có nền tảng code thống nhất ngay từ đầu.

## 2. Đóng góp cụ thể
- Xây dựng khung UI mobile-style cho toàn bộ demo (Auth, Home, Compass, Profile) bằng React + Vite.
- Thiết kế và triển khai flow chatbot gồm intake -> recommendation -> calculator -> lead capture.
- Thiết lập cấu trúc project ban đầu cho team:
  - Tổ chức thư mục component/lib rõ ràng.
  - Chuẩn hóa cách đặt state và dữ liệu dùng chung.
  - Thiết lập file env mẫu để bật/tắt AI mode.
- Tích hợp 2 chế độ vận hành:
  - AI agent mode (chat tự nhiên + tool calling).
  - Fixed-question mode (deterministic flow) để fallback khi thiếu key/API hoặc cần demo ổn định.

## 3. SPEC mạnh/yếu
- Mạnh nhất: phần User Stories theo 4 paths (happy path, low-confidence, failure, correction) vì bám sát flow UI thật và hành vi người dùng.
- Mạnh thứ hai: failure modes có tính thực tế cho sản phẩm tư vấn xe (budget mơ hồ, hallucination thông số, dữ liệu giá lệch thực tế) và đã có hướng mitigation.
- Yếu nhất: phần ROI còn ước lượng ở mức macro; chưa tách rõ công thức benefit theo từng funnel stage (view -> shortlist -> lead -> test drive).

## 4. Đóng góp khác
- Hỗ trợ team hoàn thiện poster/slide: chuyển nội dung kỹ thuật thành before/after flow dễ trình bày với peer.
- Rà soát trải nghiệm demo đầu-cuối để tránh đứt mạch khi chuyển từ chat sang recommendation, calculator và lead form.
- Chuẩn hóa README để hiển thị đầy đủ poster/hình minh họa trên GitHub.

## 5. Điều học được
Trước hackathon mình nghĩ UI chỉ là lớp hiển thị. Sau dự án này mình hiểu UI cho AI product là một phần của safety và trust:
- Cùng một model nhưng nếu flow hỏi thiếu ngữ cảnh, output dễ sai.
- Nếu không có fallback rõ ràng, chỉ cần API lỗi là demo hỏng toàn bộ trải nghiệm.
- Việc tách flow thành từng bước nhỏ giúp user kiểm soát tốt hơn và tăng khả năng conversion.

## 6. Nếu làm lại
- Sẽ lock architecture và data contract sớm hơn ngay từ đầu ngày 1 để giảm thời gian merge và chỉnh sửa chéo giữa frontend/backend.
- Sẽ thêm telemetry sớm (time-to-top3, drop-off theo bước, tỷ lệ submit lead) để đo impact theo dữ liệu thay vì ước lượng thủ công.
- Sẽ làm component guideline ngắn cho team để đồng nhất UI nhanh hơn.

## 7. AI giúp gì / AI sai gì
- **Giúp:** AI hỗ trợ brainstorm nhiều phương án UI copy, edge cases cho flow chat, và giúp viết nhanh các bản nháp nội dung poster/spec.
- **Sai/mislead:** AI thường gợi ý thêm nhiều feature hấp dẫn nhưng vượt scope (ví dụ mở rộng CRM/booking quá sớm). Nếu không bám mục tiêu demo, rất dễ bị scope creep.

## 8. Tự đánh giá cá nhân
Mình hoàn thành tốt vai trò dựng nền ban đầu và giữ được mạch trải nghiệm UI -> AI -> conversion.
Điểm cần cải thiện là đo lường sớm bằng metric thực tế để quyết định ưu tiên thay vì cảm nhận chủ quan.