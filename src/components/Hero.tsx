import ScrollReveal from "./ScrollReveal";
import HeroVisual from "./HeroVisual";

export default function Hero() {
  return (
    <section className="overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 py-20 md:grid-cols-[1.05fr_1fr] md:py-28 lg:py-32">
        <ScrollReveal>
          <p className="mb-5 inline-block rounded-full border border-border px-3 py-1 text-xs font-medium text-muted">
            Giải pháp AI cho doanh nghiệp
          </p>
          <h1 className="text-5xl font-bold leading-[1.05] tracking-tighter text-foreground sm:text-6xl lg:text-7xl">
            Giải pháp AI cho doanh nghiệp của bạn
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
            Bạn không lập ra công ty chỉ để làm những việc lặp lại mà AI có
            thể làm thay. DNK House giúp doanh nghiệp đưa AI vào vận hành
            thực tế — từ chatbot chăm sóc khách hàng đến tự động hoá quy
            trình, để đội ngũ của bạn tập trung vào việc quan trọng hơn.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href="#lien-he"
              className="rounded-full bg-accent px-6 py-3.5 text-center text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
            >
              Liên hệ tư vấn
            </a>
            <a
              href="#dich-vu"
              className="rounded-full border border-border px-6 py-3.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-surface"
            >
              Xem dịch vụ AI
            </a>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <HeroVisual />
        </ScrollReveal>
      </div>
    </section>
  );
}
