import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const features = [
  {
    title: 'Safe Payments',
    description:
      'Smart contract escrow holds funds until work is verified. No more payment disputes.',
    icon: '🔒',
  },
  {
    title: 'Campus Verified',
    description: '.edu email verification ensures only real students and staff participate.',
    icon: '🎓',
  },
  {
    title: 'NFC Tap-to-Pay',
    description: 'Meet on campus, tap your phone to release payment instantly and securely.',
    icon: '📱',
  },
  {
    title: 'Badge Trust System',
    description: 'Earn reputation badges for reliability. Higher badges unlock higher job caps.',
    icon: '🏅',
  },
];

const stats = [
  { label: 'Active Students', value: '500+' },
  { label: 'Jobs Completed', value: '1,200+' },
  { label: 'Universities', value: '15+' },
  { label: 'Avg. Payout Time', value: '< 24h' },
];

export default function Home() {
  return (
    <div>
      <section className="bg-gradient-to-br from-campus-dark via-campus-primary to-campus-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Campus gigs, <span className="text-campus-accent">secured by smart contracts</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl">
              Post and find jobs on campus with blockchain-secured payments, NFC tap-to-release, and
              a reputation badge system. Only for .edu verified students and staff.
            </p>
            <div className="flex gap-4 mt-8">
              <Link to="/signup">
                <Button size="lg" className="bg-white text-campus-primary hover:bg-gray-100">
                  Get Started
                </Button>
              </Link>
              <Link to="/jobs">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white border border-white/30 hover:bg-white/10"
                >
                  Browse Jobs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-campus-primary">{stat.value}</div>
              <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900">Why CampusCollar?</h2>
          <p className="mt-4 text-center text-gray-500 max-w-2xl mx-auto">
            Built for campus communities. Powered by Stellar blockchain.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl border border-gray-200 hover:border-campus-primary/30 hover:shadow-lg transition-all"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-campus-light py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Ready to get started?</h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            Join your campus marketplace today. Post your first job or find work — all secured by
            Stellar smart contracts.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Link to="/signup">
              <Button size="lg">Create Account</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
