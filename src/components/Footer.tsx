const LINK_GROUPS = [
  {
    title: "Dịch vụ",
    links: ["Chatbot & trợ lý ảo AI", "Tự động hoá quy trình", "Phân tích dữ liệu thông minh", "Tích hợp AI vào hệ thống"],
  },
  {
    title: "Công ty",
    links: ["Về chúng tôi", "Quy trình làm việc", "Liên hệ"],
  },
  {
    title: "Pháp lý",
    links: ["Chính sách bảo mật", "Điều khoản dịch vụ"],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-6 py-12 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-2xl font-bold tracking-tight text-foreground">
            Bạn đã thấy cách chúng tôi làm việc.
            <br className="hidden sm:block" /> Giờ hãy để DNK House bắt tay
            vào việc.
          </p>
          <a
            href="#lien-he"
            className="shrink-0 rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            Liên hệ tư vấn
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <a href="#" className="text-lg font-bold tracking-tight text-foreground">
              DNK <span className="text-accent">House</span>
            </a>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              Đối tác tư vấn và triển khai giải pháp AI cho doanh nghiệp.
            </p>
          </div>

          {LINK_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="text-sm font-semibold text-foreground">{group.title}</p>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} DNK House. All rights reserved.
          </p>
          <p className="text-xs text-muted">[Địa chỉ công ty]</p>
        </div>
      </div>
    </footer>
  );
}
