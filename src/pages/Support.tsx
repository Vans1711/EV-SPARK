
import { useState } from 'react';
import { Phone, AlertTriangle, HelpCircle, LifeBuoy, MessageSquare, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from "@/hooks/use-toast";

const faqData = [
  {
    question: "How do I find the nearest charging station?",
    answer: "You can use our 'Find Stations' feature in the app or website. Enter your location or allow location access, and we'll show you the nearest available charging stations along with real-time availability status."
  },
  {
    question: "What payment methods are accepted?",
    answer: "EV Spark accepts multiple payment methods including credit/debit cards, UPI, mobile wallets, and our prepaid Spark Wallet. You can manage your payment preferences in your account settings."
  },
  {
    question: "How does the Spark Rewards program work?",
    answer: "Every time you charge your vehicle at our stations, you earn Spark Coins based on the energy consumed. These coins can be redeemed for discounts on future charging sessions, partner offers, and other benefits."
  },
  {
    question: "What should I do if a charging station is not working?",
    answer: "If you encounter any issues with our charging stations, please use the 'Report Issue' feature in the app or contact our 24/7 support line. Our team will assist you immediately."
  },
  {
    question: "Can I reserve a charging slot in advance?",
    answer: "Yes, you can schedule and reserve charging slots up to 7 days in advance through our app or website. Premium members get priority booking privileges."
  },
  {
    question: "How do I update my vehicle information?",
    answer: "You can update your vehicle details in the 'My Profile' section of your dashboard. This helps us provide you with compatible charging stations and personalized recommendations."
  }
];

const SupportPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('emergency');
  
  const handleEmergencyRequest = () => {
    toast({
      title: "Emergency Request Sent",
      description: "Our support team has been notified and will contact you shortly.",
    });
  };
  
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "Thank you for contacting us. We'll get back to you soon.",
    });
    setName('');
    setEmail('');
    setMessage('');
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-ev-dark-200">
      <Navbar />
      
      <main className="flex-grow pt-24 px-6 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Support Center</h1>
              <p className="text-white/70 mt-1">Get help with your EV charging needs</p>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-3xl grid-cols-3 bg-ev-dark-100 border border-white/10">
                <TabsTrigger value="emergency">Emergency</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
                <TabsTrigger value="contact">Contact Us</TabsTrigger>
              </TabsList>
              
              <TabsContent value="emergency" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="neo-card col-span-1">
                    <CardHeader className="bg-red-500/10 border-b border-white/5">
                      <CardTitle className="text-white flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                        Emergency Support
                      </CardTitle>
                      <CardDescription className="text-white/70">
                        Get immediate assistance for urgent situations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        <div className="bg-ev-dark-100/50 p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Phone className="h-5 w-5 text-ev-green-400 mr-2" />
                            <h3 className="text-white font-medium">Emergency Hotline</h3>
                          </div>
                          <p className="text-white/70">For immediate assistance:</p>
                          <a href="tel:+1800123456" className="text-ev-green-400 text-xl font-bold block mt-1 hover:underline">
                            +1-800-123-456
                          </a>
                          <p className="text-white/60 text-xs mt-1">Available 24/7</p>
                        </div>
                        
                        <Button 
                          className="w-full bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 h-12"
                          onClick={handleEmergencyRequest}
                        >
                          <LifeBuoy className="h-5 w-5" />
                          <span>Request Emergency Assistance</span>
                        </Button>
                        
                        <div className="space-y-3">
                          <h4 className="text-white font-medium">What qualifies as an emergency?</h4>
                          <ul className="text-white/70 text-sm space-y-2 list-disc pl-5">
                            <li>Vehicle breakdown at charging station</li>
                            <li>Electric hazards or safety concerns</li>
                            <li>Charging equipment damage</li>
                            <li>Vehicle incompatibility issues</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="neo-card col-span-1 lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-white">Emergency Assistance Form</CardTitle>
                      <CardDescription className="text-white/70">
                        Fill out this form for urgent assistance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="emergency-name" className="text-white">Full Name</label>
                            <Input 
                              id="emergency-name" 
                              placeholder="Enter your full name" 
                              className="bg-ev-dark-100 border-white/10 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="emergency-phone" className="text-white">Phone Number</label>
                            <Input 
                              id="emergency-phone" 
                              placeholder="Enter your phone number" 
                              className="bg-ev-dark-100 border-white/10 text-white"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="emergency-location" className="text-white">Current Location</label>
                          <Input 
                            id="emergency-location" 
                            placeholder="Enter your current location or station ID" 
                            className="bg-ev-dark-100 border-white/10 text-white"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="emergency-type" className="text-white">Type of Emergency</label>
                          <select 
                            id="emergency-type" 
                            className="w-full bg-ev-dark-100 border border-white/10 text-white rounded-md px-3 py-2"
                          >
                            <option value="">Select emergency type</option>
                            <option value="breakdown">Vehicle Breakdown</option>
                            <option value="electric">Electrical Issue</option>
                            <option value="damage">Equipment Damage</option>
                            <option value="compatibility">Compatibility Issue</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="emergency-description" className="text-white">Description of Emergency</label>
                          <Textarea 
                            id="emergency-description" 
                            placeholder="Please describe your emergency situation in detail" 
                            className="bg-ev-dark-100 border-white/10 text-white min-h-[120px]"
                          />
                        </div>
                        
                        <Button 
                          className="w-full bg-red-500 hover:bg-red-600 text-white"
                          onClick={handleEmergencyRequest}
                        >
                          Submit Emergency Request
                        </Button>
                        
                        <p className="text-white/60 text-xs text-center">
                          For immediate assistance, call our emergency hotline at +1-800-123-456
                        </p>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="faq" className="mt-6">
                <Card className="neo-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <HelpCircle className="h-5 w-5 text-ev-green-400 mr-2" />
                      Frequently Asked Questions
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      Find answers to common questions about EV Spark services
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {faqData.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="border-white/10">
                          <AccordionTrigger className="text-white hover:text-ev-green-400">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-white/70">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                    
                    <div className="mt-8 bg-ev-dark-100/50 p-4 rounded-lg text-center">
                      <h3 className="text-white font-medium">Still have questions?</h3>
                      <p className="text-white/70 mt-1">
                        Our support team is available to help 24/7
                      </p>
                      <div className="flex justify-center mt-4 space-x-4">
                        <Button 
                          variant="outline" 
                          className="border-white/10 text-white hover:bg-white/5 hover:text-ev-green-400"
                          onClick={() => setActiveTab('contact')}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Contact Us
                        </Button>
                        <Button className="bg-ev-green-500 hover:bg-ev-green-600 text-white">
                          <Phone className="h-4 w-4 mr-2" />
                          Call Support
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="contact" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="neo-card col-span-1 lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-white">Contact Us</CardTitle>
                      <CardDescription className="text-white/70">
                        Send us a message and we'll get back to you
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-4" onSubmit={handleContactSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="name" className="text-white">Name</label>
                            <Input 
                              id="name" 
                              placeholder="Enter your name" 
                              className="bg-ev-dark-100 border-white/10 text-white"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="email" className="text-white">Email</label>
                            <Input 
                              id="email" 
                              placeholder="Enter your email" 
                              type="email"
                              className="bg-ev-dark-100 border-white/10 text-white"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="subject" className="text-white">Subject</label>
                          <select 
                            id="subject" 
                            className="w-full bg-ev-dark-100 border border-white/10 text-white rounded-md px-3 py-2"
                          >
                            <option value="">Select subject</option>
                            <option value="general">General Inquiry</option>
                            <option value="technical">Technical Support</option>
                            <option value="billing">Billing & Payments</option>
                            <option value="feedback">Feedback</option>
                            <option value="partnership">Partnership</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="message" className="text-white">Message</label>
                          <Textarea 
                            id="message" 
                            placeholder="Enter your message" 
                            className="bg-ev-dark-100 border-white/10 text-white min-h-[150px]"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                          />
                        </div>
                        
                        <Button 
                          type="submit"
                          className="w-full bg-ev-green-500 hover:bg-ev-green-600 text-white"
                        >
                          Send Message
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                  
                  <Card className="neo-card col-span-1">
                    <CardHeader>
                      <CardTitle className="text-white">Contact Information</CardTitle>
                      <CardDescription className="text-white/70">
                        Reach out to us through these channels
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-white font-medium flex items-center">
                            <Phone className="h-4 w-4 text-ev-green-400 mr-2" />
                            Phone
                          </h3>
                          <p className="text-white/70">
                            Customer Support: +1-800-123-456
                          </p>
                          <p className="text-white/70">
                            Business Inquiries: +1-800-789-012
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-white font-medium flex items-center">
                            <MessageSquare className="h-4 w-4 text-ev-green-400 mr-2" />
                            Email
                          </h3>
                          <p className="text-white/70">
                            Support: support@evspark.com
                          </p>
                          <p className="text-white/70">
                            Info: info@evspark.com
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-white font-medium flex items-center">
                            <Zap className="h-4 w-4 text-ev-green-400 mr-2" />
                            Office Hours
                          </h3>
                          <p className="text-white/70">
                            Monday - Friday: 9 AM - 6 PM
                          </p>
                          <p className="text-white/70">
                            Saturday: 10 AM - 4 PM
                          </p>
                          <p className="text-white/70">
                            24/7 Emergency Support Available
                          </p>
                        </div>
                        
                        <div className="pt-4 border-t border-white/10">
                          <h3 className="text-white font-medium mb-3">Follow Us</h3>
                          <div className="flex space-x-4">
                            {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                              <a 
                                key={social}
                                href="#" 
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-ev-green-500/20 flex items-center justify-center transition-colors"
                              >
                                <span className="sr-only">{social}</span>
                                <div className="w-4 h-4 text-white/70 hover:text-ev-green-400"></div>
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SupportPage;
