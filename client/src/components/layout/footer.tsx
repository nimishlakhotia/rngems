import { Link } from 'wouter';
import { Gem } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-lg mb-4">
              <Gem className="h-5 w-5" />
              StoneVault
            </div>
            <p className="text-sm text-muted-foreground">
              Premium gemstones for collectors and enthusiasts worldwide.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/shop">
                  <a className="hover:text-primary">All Stones</a>
                </Link>
              </li>
              <li>
                <Link href="/shop?type=DIAMOND">
                  <a className="hover:text-primary">Diamonds</a>
                </Link>
              </li>
              <li>
                <Link href="/shop?type=RUBY">
                  <a className="hover:text-primary">Rubies</a>
                </Link>
              </li>
              <li>
                <Link href="/shop?type=SAPPHIRE">
                  <a className="hover:text-primary">Sapphires</a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/faq">
                  <a className="hover:text-primary">FAQ</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="hover:text-primary">Contact Us</a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} StoneVault. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}