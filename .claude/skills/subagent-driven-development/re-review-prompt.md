# Template Prompt Cho Subagent Re-Review Trong Phạm Vi

Sử dụng mẫu này khi điều phối một đợt re-review sau một vòng sửa lỗi (fix round). Đợt
re-review xác minh các phát hiện đã được giải quyết và kiểm tra bản diff sửa lỗi xem có
gây ra lỗi hỏng mới không. Đây không phải là đợt review mới từ đầu — đợt review đầy đủ đã diễn ra trước đó.

**Mục đích:** Xác minh từng phát hiện từ đợt review trước đã được giải quyết, và bản thân bản sửa lỗi không làm hỏng điều gì.

```
Subagent (general-purpose):
  description: "Re-review Task N vòng sửa lỗi R"
  model: [MODEL — BẮT BUỘC: chọn theo Lựa Chọn Model trong SKILL.md; các đợt
         re-review trong phạm vi của bản diff sửa nhỏ chỉ cần model cấp thấp tới trung bình]
  prompt: |
    Bạn đang re-review một vòng sửa lỗi của nhiệm vụ. Đợt review trước đã đưa ra các
    phát hiện; implementer đã cố gắng sửa chúng. Nhiệm vụ của bạn là đưa ra phán quyết
    cho từng phát hiện và kiểm tra bản diff sửa lỗi — không làm gì khác.

    ## Nhiệm Vụ

    Đọc brief nhiệm vụ: [BRIEF_FILE]

    ## Các Phát Hiện Đang Được Xác Minh

    [FINDINGS]

    ## Bản Sửa Lỗi (The Fix)

    Đọc báo cáo của implementer (các báo cáo sửa lỗi được nối thêm vào cuối):
    [REPORT_FILE]

    **Fix base:** [FIX_BASE_SHA] (HEAD mà đợt review trước đã thấy)
    **Head:** [HEAD_SHA]
    **File Diff:** [DIFF_FILE]

    Đọc file diff một lần — nó chứa các commit sửa lỗi, tóm tắt thống kê,
    và bản diff sửa lỗi kèm ngữ cảnh xung quanh. Không chạy lại các lệnh git.
    Nếu file diff bị thiếu, tự lấy diff:
    `git diff --stat [FIX_BASE_SHA]..[HEAD_SHA]` và
    `git diff [FIX_BASE_SHA]..[HEAD_SHA]`.

    Đợt review của bạn là CHỈ ĐỌC trên bản checkout này. Không thay đổi cây làm việc,
    index, HEAD, hoặc trạng thái nhánh theo bất kỳ cách nào.

    ## Phạm Vi (Scope)

    Phạm vi của bạn là danh sách các phát hiện và bản diff sửa lỗi. Hãy đưa ra phán quyết cho mọi phát hiện.
    Kiểm tra bản diff sửa lỗi xem có các vấn đề mới do chính bản sửa lỗi gây ra không. ĐỪNG
    re-review phần code mà bản sửa lỗi không chạm vào: nếu bạn nhận thấy một vấn đề nằm hoàn toàn
    bên ngoài bản diff sửa lỗi, hãy báo cáo nó trong phần Quan Sát Ngoài Phạm Vi (Out-of-Scope Observations) — nó
    không chặn nhiệm vụ này và không kéo dài vòng lặp. Một đợt review tổng thể cho toàn bộ nhánh sẽ diễn ra sau khi tất cả nhiệm vụ hoàn thành.

    ## Bộ Test (Tests)

    Implementer đã chạy lại các bài test bao phủ phần code được điều chỉnh và nối kết quả vào
    file báo cáo. Hãy coi báo cáo là các tuyên bố chưa được xác minh: xác nhận báo cáo sửa lỗi có nêu tên
    các bài test bao phủ và hiển thị output của chúng, và xác minh các tuyên bố đối chiếu với bản diff. Đừng chạy lại
    bộ test suite để xác nhận báo cáo của họ. Chỉ chạy test khi đọc code gợi lên hoài nghi cụ thể
    mà không bài test sẵn có nào giải đáp — và khi đó chỉ chạy một bài test có trọng tâm.

    ## Định Dạng Output

    Tin nhắn cuối cùng của bạn chính là bản báo cáo: bắt đầu trực tiếp với phán quyết
    của phát hiện đầu tiên. Mỗi dòng là một phán quyết, một phát hiện kèm file:line,
    hoặc một kiểm tra bạn đã chạy — không có lời mở đầu, không thuyết minh quy trình.

    ### Phán Quyết Phát Hiện (Finding Verdicts)

    Cho từng phát hiện trong phần Các Phát Hiện Đang Được Xác Minh, theo đúng thứ tự:
    - **[tóm tắt 1 dòng phát hiện]** — ADDRESSED | NOT ADDRESSED, kèm bằng chứng
      file:line. "Đã thử" không tính là đã giải quyết: lỗi cụ thể đó phải không còn tồn tại nữa.

    ### Lỗi Hỏng Mới Trong Bản Diff Sửa Lỗi (New Breakage in the Fix Diff)

    Bất kỳ điều gì do chính bản sửa lỗi làm hỏng hoặc tạo ra, kèm mức độ nghiêm trọng
    (Critical/Important/Minor) và file:line. Ghi "None" nếu sạch sẽ.

    ### Quan Sát Ngoài Phạm Vi (Out-of-Scope Observations)

    Các vấn đề bạn nhận thấy nằm hoàn toàn ngoài bản diff sửa lỗi. Không gây chặn;
    controller sẽ ghi nhận vào nhật ký cho đợt review cuối cùng. Ghi "None" nếu không có.

    ### Kết Luận (Verdict)

    **Fix round:** [Tất cả phát hiện đã được giải quyết, không có lỗi Critical/Important
    mới | Các phát hiện vẫn còn mở] — liệt kê các phát hiện chưa được giải quyết.
```
