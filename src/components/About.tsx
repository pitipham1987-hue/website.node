import ScrollReveal from "./ScrollReveal";

// TODO: số liệu placeholder — thay bằng con số thật của DNK House trước khi publish
const STATS = [
  { value: "50+", label: "Dự án AI đã triển khai" },
  { value: "98%", label: "Khách hàng hài lòng" },
  { value: "24/7", label: "Giám sát & vận hành" },
];

export default function About() {
  return (
    <section id="ve-chung-toi" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <ScrollReveal className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Đối tác AI đáng tin cậy, chuẩn mực chuyên nghiệp
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            DNK House là đội ngũ tư vấn và triển khai giải pháp AI cho doanh
            nghiệp, hoạt động trên nguyên tắc minh bạch, cam kết đúng tiến độ
            và luôn đặt kết quả thực tế của khách hàng lên hàng đầu.
          </p>
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STATS.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 0.08}>
              <div className="rounded-2xl border border-border bg-surface p-8 text-center">
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-2 text-sm text-muted">{stat.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
