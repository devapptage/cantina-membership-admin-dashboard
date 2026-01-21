import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Privacy Policy - Cantina Añejo",
  description: "Privacy Policy for Cantina Añejo - Learn how we collect, use, and protect your information",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-5xl">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <span className="font-semibold text-lg">Cantina Añejo</span>
          </Link>
          <Link 
            href="/login" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Admin Login
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Effective Date: January 22, 2026
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-foreground leading-relaxed">
              At Cantina Añejo, your privacy matters to us. This Privacy Policy explains what information we collect when you use our website or mobile app, how we use it, and how you can manage it.
            </p>
          </CardContent>
        </Card>

        {/* Section 1 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                1
              </span>
              What We Collect
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-foreground/90 leading-relaxed">
              <p>When you interact with us, we may collect:</p>
              <ul className="space-y-3 ml-6">
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">Information you give us directly:</strong> your name, email, phone number, reservation details, or any messages you send us.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">Information collected automatically:</strong> things like your device type, browser, IP address, or how you use our website or app.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">Payment information:</strong> if you make a purchase, we use secure payment providers. We don't store full credit card numbers ourselves.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">Optional information:</strong> like location, if you give permission on our app.</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Section 2 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                2
              </span>
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-foreground/90 leading-relaxed">
              <p>We use your information to:</p>
              <ul className="space-y-3 ml-6">
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Provide and improve our services</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Process reservations, memberships, or purchases</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Send you updates, promotions, or event info (only if you've agreed to it)</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Respond to your questions or requests</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Make your experience with our website or app better</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Section 3 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                3
              </span>
              Cookies & Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/90 leading-relaxed">
              We may use cookies or similar tools to help our website or app work properly and to understand how people use it. You can choose to disable cookies, but some features might not work fully.
            </p>
          </CardContent>
        </Card>

        {/* Section 4 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                4
              </span>
              Sharing Your Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-foreground/90 leading-relaxed">
              <p>We don't sell your information. We may share it:</p>
              <ul className="space-y-3 ml-6">
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>With service providers who help us run the website or app (like payment processors)</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>If the law requires it</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>With your consent, for example, if you participate in a promotion</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Section 5 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                5
              </span>
              Your Rights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-foreground/90 leading-relaxed">
              <p>You can:</p>
              <ul className="space-y-3 ml-6">
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Access or update your information</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Delete your information</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Opt out of marketing messages</span>
                </li>
              </ul>
              <p className="mt-4">
                To do this, contact us at{" "}
                <a 
                  href="mailto:contact@cantinaanejo.com" 
                  className="text-primary hover:underline"
                >
                  contact@cantinaanejo.com
                </a>
                .
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 6 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                6
              </span>
              Children's Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/90 leading-relaxed">
              Our services are not intended for children under 13. We do not knowingly collect information from children.
            </p>
          </CardContent>
        </Card>

        {/* Section 7 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                7
              </span>
              Third-Party Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/90 leading-relaxed">
              Our website or app may include links to other sites. We are not responsible for their privacy practices, so check their policies if you provide information there.
            </p>
          </CardContent>
        </Card>

        {/* Section 8 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                8
              </span>
              Changes to This Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/90 leading-relaxed">
              We may update this policy occasionally. The "Effective Date" will show the most recent version. Significant changes will be shared on our website or app.
            </p>
          </CardContent>
        </Card>

        {/* Section 9 - Contact */}
        <Card className="mb-6 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                9
              </span>
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-foreground/90 leading-relaxed">
              <p>If you have questions about this Privacy Policy, reach out to us:</p>
              <div className="flex flex-col gap-3 mt-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-primary text-xl">📧</span>
                  <a 
                    href="mailto:contact@cantinaanejo.com" 
                    className="text-primary hover:underline font-medium"
                  >
                    contact@cantinaanejo.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-primary text-xl">📍</span>
                  <span className="font-medium">Cantina Añejo</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-sm mb-4">
            © {new Date().getFullYear()} Cantina Añejo. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/privacy-policy" className="text-primary font-medium">
              Privacy Policy
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

