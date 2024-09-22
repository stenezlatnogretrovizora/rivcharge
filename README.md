![RivCharge](./public/logo.png "RivCharge Logo")

# RivCharge
RiVCharge is a platform that allows users to schedule charging their electric vehicles at work @ Rivian offices. The platform allows users to find charging stations, schedule charging times, and be notified of upcoming charges.

## Lighthouse
<img width="700" alt="Screenshot 2024-09-22 at 22 53 38" src="https://github.com/user-attachments/assets/ffd3c321-8299-41f9-ae49-6891ccf52bd6">

## Presentation
https://github.com/user-attachments/assets/431f608a-06d0-4ca5-b4f6-b35dc3340ec9

https://github.com/user-attachments/assets/8b2408e2-7a1f-49c6-bf02-0fe0f96fcfb6

https://github.com/user-attachments/assets/47315258-b4bd-46fe-a17b-2b04895199a8

# Assumptions

## Size and Scope (scalability)

In Serbia, Rivan has ~300 engineers (source blog post).

In total, Rivian has around 15.000 employees.

**Low Traffic Projection:**

If the app was being used by whole Belgrade office, at an average of 10 requests per hour, we get the number of 3000 average RPH, which is 50 requests per minute or ~1RPS. During the night this can drop to 0, so we would want our app to be able to scale down to zero.

**~0-1RPS**

**High Traffic Projection**

If the app was being used by the whole Rivian, that would be ~50RPS.
Even doubling the size of the company, and doubling again in peak hours, on the high end, we would have to serve an average 200 requests per second.

**~200RPS**

The system should be able to handle up to 1000 concurrent users

All communication must be encrypted using HTTPS. Services should be in the same VPC.

API responses should be delivered within 200ms

The system should have 99.9% uptime

The system must adhere to data protection regulations (e.g., GDPR)

- All Rivian employees have Google accounts for authentication
- The system will be used exclusively by Rivian employees
- The charging stations are capable of reporting their status in real-time
- [optional]: The charging stations and phones have an NFC reader
- [optional]: Completely eliminate UI - have only a chat assistant

## Choices

t3-generator, because it’s a good starter project with nice folder structure, support for Prisma, Typescript, auth. I also wanted to play around with 

### Why Prisma?

Since I’ve been working with Prisma for the past 2 years, and went from hating it to tolerating it, I think it was the best choice at the moment. Prisma has a great schema definitions, migrations are a breeze, and it’s fast to get up and running, plus when there is a need for any other driver, it can be extended.

### Why Typescript

Because writing Javascript on the server is crazy.

### Ok smartass, why not anything else?

Go would have been a good choice, Python as well. However, since I’m most comfortable with Node ecosystem and tooling, and the speed is of the essence I chose the safer approach. 

Also, as I heard we would be writing Node.js in Rivian so it made sense for me to be judged by the skills that I’ll actually utilise in the target role.

### Why Google OAuth?

Other providers could also be easily used. Google was randomly chosen.




You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
