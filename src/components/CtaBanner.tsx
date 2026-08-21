import { Mail, Phone } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

export default function CtaBanner() {
  return (
    <section id="lien-he" className="border-t border-border bg-accent">
      <div className="mx-auto max-w-6xl px-6 py-20 text-center md:py-28">
        <ScrollReveal>
          <h2 className="text-3xl font-bold tracking-tight text-accent-foreground sm:text-4xl">
            Sẵn sàng bắt đầu cùng DNK House?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-accent-foreground/80">
            Chia sẻ bài toán của bạn, đội ngũ DNK House sẽ phản hồi trong vòng
            24 giờ làm việc với đề xuất giải pháp AI phù hợp.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="mailto:contact@dnkhouse.vn"
              className="flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-accent transition-opacity hover:opacity-90"
            >
              <Mail size={16} />
              contact@dnkhouse.vn
            </a>
            <a
              href="tel:+84000000000"
              className="flex items-center gap-2 rounded-full border border-white/30 px-6 py-3.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-white/10"
            >
              <Phone size={16} />
              [Số điện thoại]
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
