import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const msg = {
      to: params.to,
      from: {
        email: params.from,
        name: 'Rate Card Calculator'
      },
      subject: params.subject,
      text: params.text || 'Please view this email in HTML format.',
      html: params.html,
    };
    
    console.log('Sending email with params:', {
      to: params.to,
      from: params.from,
      subject: params.subject
    });
    
    const result = await mailService.send(msg);
    console.log('Email sent successfully:', result[0].statusCode);
    return true;
  } catch (error: any) {
    console.error('SendGrid email error:', error);
    if (error.response) {
      console.error('SendGrid response body:', error.response.body);
    }
    return false;
  }
}
