import Link from "next/link";
import { footerNav, siteConfig } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { MailIcon, PhoneIcon } from "@/components/ui/Icons";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer id="contact" className="bg-navy-950 text-navy-200">
      <Container className="py-14 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-5 text-sm leading-relaxed">
              Verified drivers, vetted owners and clear daily pricing, in one place.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              <li>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="inline-flex items-center gap-2.5 text-white hover:text-gold-400"
                >
                  <MailIcon className="text-gold-400" width={18} height={18} />
                  {siteConfig.contact.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2.5 text-white hover:text-gold-400"
                >
                  <PhoneIcon className="text-gold-400" width={18} height={18} />
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li className="pl-[1.775rem]">{siteConfig.contact.hours}</li>
            </ul>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerNav.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold text-white">{group.title}</h3>
                <ul className="mt-4 space-y-3 text-sm">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="transition-colors hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <ul className="flex gap-6">
            <li>
              <Link href="#" className="hover:text-white">
                Terms
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white">
                Privacy
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
