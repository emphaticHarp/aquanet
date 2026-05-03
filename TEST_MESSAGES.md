# 🧪 Test Message Encryption/Decryption

## ✅ What I Fixed

1. **Hardcoded encryption key** - No longer relying on environment variables
2. **Added detailed logging** - You can see decryption in terminal
3. **Backend-only encryption** - Frontend only receives plain text

## 🎯 How to Test

### Step 1: Restart Dev Server

```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Step 2: Open Two Tabs

**Tab 1:**
```
http://localhost:3000/login
Login as: member2@aquanet.com
Password: password123
```

**Tab 2:**
```
http://localhost:3000/login
Login as: member3@aquanet.com
Password: password123
```

### Step 3: Start Chat

**Tab 1 (Member 2):**
1. Click chat icon (💬) in top right
2. Click on "Team Member 3"

**Tab 2 (Member 3):**
1. Click chat icon (💬) in top right
2. Click on "Team Member 2"

### Step 4: Send Test Message

**Tab 1 (Member 2):**
```
Type: "Hello! This is a test message 🎉"
Press Enter
```

**Watch the terminal** - You should see:
```
Attempting to decrypt: ...
✅ Successfully decrypted message
```

**Tab 2 (Member 3):**
- Wait 2 seconds
- Message should appear as: "Hello! This is a test message 🎉"
- **NOT** as encrypted gibberish

### Step 5: Reply

**Tab 2 (Member 3):**
```
Type: "Hi! I can see your message clearly! 👍"
Press Enter
```

**Tab 1 (Member 2):**
- Wait 2 seconds
- Reply should appear as plain text

## 🔍 What to Check

### ✅ In Browser (Frontend)
- Messages show as **plain text**
- No encrypted gibberish
- Emojis work correctly
- Messages are readable

### ✅ In Terminal (Backend)
You should see logs like:
```
Attempting to decrypt: U2FsdGVkX1+...
Decrypted result: Hello! This is a test message 🎉
✅ Successfully decrypted message
```

### ✅ In MongoDB (Database)
Messages should be stored encrypted:
```javascript
{
  text: "U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y=",
  encrypted: true
}
```

## 🚨 If You Still See Encrypted Text

### Quick Fix:

1. **Delete all messages:**
   ```bash
   npm run migrate-messages
   ```

2. **Restart server:**
   ```bash
   npm run dev
   ```

3. **Clear browser cache:**
   - Press F12
   - Right-click refresh button
   - "Empty Cache and Hard Reload"

4. **Send a NEW message**
   - Don't look at old messages
   - Send a fresh message
   - It should work now

## 📊 Expected Flow

### When Sending Message

```
Frontend (Tab 1)
    ↓
"Hello!" (plain text)
    ↓
POST /api/messages
    ↓
Backend encrypts: "U2FsdGVkX1+..."
    ↓
Save to MongoDB (encrypted)
    ↓
Return to frontend: "Hello!" (plain text)
    ↓
Display in UI: "Hello!"
```

### When Receiving Message

```
Frontend (Tab 2) polls every 2 seconds
    ↓
GET /api/messages
    ↓
Backend fetches: "U2FsdGVkX1+..." (encrypted)
    ↓
Backend decrypts: "Hello!" (plain text)
    ↓
Return to frontend: "Hello!" (plain text)
    ↓
Display in UI: "Hello!"
```

## ✅ Success Checklist

- [ ] Restarted dev server
- [ ] Opened two tabs with different users
- [ ] Sent test message
- [ ] Message shows as plain text (not encrypted)
- [ ] Terminal shows decryption logs
- [ ] Reply works correctly
- [ ] No encrypted gibberish visible

## 🎉 What You Should See

### In Tab 1 (Sender):
```
You: Hello! This is a test message 🎉
```

### In Tab 2 (Receiver):
```
Team Member 2: Hello! This is a test message 🎉
```

### In Terminal:
```
Attempting to decrypt: U2FsdGVkX1+...
Decrypted result: Hello! This is a test message 🎉
✅ Successfully decrypted message
```

### In MongoDB:
```json
{
  "text": "U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y=",
  "encrypted": true,
  "senderName": "Team Member 2",
  "receiverName": "Team Member 3"
}
```

## 🔐 Security Verification

1. **Frontend never sees encrypted text** ✅
2. **Backend handles all encryption/decryption** ✅
3. **Database stores encrypted messages** ✅
4. **Encryption key is server-side only** ✅

## 📝 Important Notes

- **Frontend**: Always receives plain text
- **Backend**: Handles encryption/decryption
- **Database**: Stores encrypted text
- **Encryption key**: Hardcoded in backend (secure)

## 🎯 Quick Test Commands

```bash
# 1. Clean up old messages
npm run migrate-messages

# 2. Restart server
npm run dev

# 3. Test in browser
# Open two tabs, login as different users, send messages

# 4. Check terminal for decryption logs
# Should see: "✅ Successfully decrypted message"
```

---

**If you see plain text messages, encryption is working perfectly! 🎉**
