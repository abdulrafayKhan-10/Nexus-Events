# 🎫 RafayEvents - Premium Event Ticketing Platform

**A stunning, production-ready event ticketing system powering seamless event experiences from creation to analytics.**

## 🚀 **Live Demo & Quick Start**

```bash
# One-command startup (Windows)
./start-enhanced.bat

# Manual startup
cd EventTicketing.API && dotnet run
cd EventTicketingfrontend && npm run dev
```

**🔗 Access Points:**
- **Frontend**: http://localhost:3000
- **API Documentation**: http://localhost:5251/swagger

## 🏗️ **Architecture**

```
RafayEvents/
├── 🎯 EventTicketing.API/          # .NET 9 Web API
├── ⚛️ EventTicketingfrontend/      # React + TypeScript (Next.js)
├── 🧪 EventTicketing.Tests/        # Comprehensive Testing
└── 🔄 .github/workflows/           # CI/CD Automation
```

## ✨ **Key Features**

### **🏢 For Event Organizers**
- **Multi-tenant Architecture** - Support for multiple event organizers
- **Real-time Capacity Management** - Prevent overbooking with live updates
- **Advanced Analytics Dashboard** - Revenue, demographics, and performance metrics
- **QR Code Integration** - Secure ticket validation system

### **🔐 Security-First Design**
- **JWT Authentication** with refresh token rotation
- **Role-based Authorization** (Admin/Organizer/Customer)
- **Input Sanitization** preventing injection attacks

## 🛠️ **Technology Stack**

### **Backend (.NET 9)**
- **ASP.NET Core Web API** - High-performance REST endpoints
- **Entity Framework Core** - Advanced ORM with LINQ
- **JWT Authentication** - Stateless security

### **Frontend (React + TypeScript)**
- **Next.js 15** - Server-side rendering & optimization
- **Tailwind CSS V4** - Beautiful responsive layouts
- **Lucide Icons** - Crisp vector graphics

## 🚀 **Getting Started**

### **Prerequisites**
- **.NET 9 SDK** ([Download](https://dotnet.microsoft.com/download))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **SQL Server** (Express or full version)

### **Installation & Setup**

1. **Database Setup**
   ```bash
   cd EventTicketing.API
   dotnet ef database update
   ```

2. **Quick Demo Launch**
   Use our automated startup script (Windows):
   ```bash
   ./start-enhanced.bat
   ```

## 👨‍💻 **About the Developer**

**Abdul Rafay Khan** - Full Stack Developer

---
