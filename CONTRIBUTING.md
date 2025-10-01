# 🤝 Contributing to Eye Detection System

ขอบคุณที่สนใจมีส่วนร่วมในโปรเจค Eye Detection! เรายินดีรับ contributions ทุกรูปแบบ

## 📋 วิธีการมีส่วนร่วม

### 🐛 รายงาน Bug

1. ไปที่ [Issues](https://github.com/HumNoi1/Eye_Detection/issues)
2. คลิก "New Issue"
3. เลือก "Bug Report"
4. กรอกข้อมูลให้ครบถ้วน:
   - **คำอธิบาย**: อธิบายปัญหาอย่างละเอียด
   - **Steps to Reproduce**: ขั้นตอนการทำซ้ำปัญหา
   - **Expected Behavior**: ผลลัพธ์ที่คาดหวัง
   - **Actual Behavior**: ผลลัพธ์ที่เกิดขึ้นจริง
   - **Environment**: OS, Python version, Node version
   - **Logs**: Backend logs, Browser console errors
   - **Screenshots**: ถ้ามี

### 💡 เสนอ Feature ใหม่

1. ไปที่ [Issues](https://github.com/HumNoi1/Eye_Detection/issues)
2. คลิก "New Issue"
3. เลือก "Feature Request"
4. อธิบาย feature ที่ต้องการ:
   - **Problem**: ปัญหาที่ feature นี้จะแก้ไข
   - **Solution**: วิธีการที่เสนอ
   - **Alternatives**: ทางเลือกอื่นที่พิจารณาแล้ว
   - **Additional Context**: ข้อมูลเพิ่มเติม

### 🔧 Submit Code

#### 1. Fork และ Clone

```bash
# Fork repo ผ่าน GitHub UI
# จากนั้น clone fork ของคุณ
git clone https://github.com/YOUR_USERNAME/Eye_Detection.git
cd Eye_Detection
```

#### 2. สร้าง Branch ใหม่

```bash
git checkout -b feature/amazing-feature
# หรือ
git checkout -b fix/bug-description
```

**ชื่อ Branch แนะนำ:**
- `feature/` - สำหรับ feature ใหม่
- `fix/` - สำหรับแก้ bug
- `docs/` - สำหรับแก้ documentation
- `refactor/` - สำหรับ refactor code
- `test/` - สำหรับเพิ่ม tests

#### 3. ทำการเปลี่ยนแปลง

ติดตาม coding standards:

**Python (Backend):**
- ใช้ [PEP 8](https://pep8.org/)
- ใช้ type hints
- เขียน docstrings
- ใช้ logging แทน print()

```python
def get_user_by_label(label: str) -> dict | None:
    """
    Query user from database by label.
    
    Args:
        label: The label to search for
        
    Returns:
        User data dict or None if not found
    """
    logger.info(f"Querying user for label: {label}")
    # ...
```

**TypeScript (Frontend):**
- ใช้ TypeScript (ไม่ใช้ `any` เว้นแต่จำเป็น)
- ใช้ functional components
- ใช้ React hooks
- เขียน JSDoc comments

```typescript
/**
 * Connects to WebSocket server and handles camera stream
 */
const connectWebSocket = useCallback(() => {
  // ...
}, []);
```

#### 4. เขียน Tests (ถ้ามี)

```bash
# Backend tests
cd backend
python -m pytest test_api.py
python test_database.py

# Frontend tests (ถ้ามี)
cd frontend
npm test
```

#### 5. Commit Changes

ใช้ [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add multi-language support"
git commit -m "fix: resolve WebSocket reconnection issue"
git commit -m "docs: update installation guide"
git commit -m "refactor: optimize frame processing"
```

**Commit Types:**
- `feat`: Feature ใหม่
- `fix`: แก้ bug
- `docs`: เปลี่ยน documentation
- `style`: เปลี่ยน formatting (ไม่เปลี่ยน logic)
- `refactor`: Refactor code
- `test`: เพิ่มหรือแก้ tests
- `chore`: งานอื่นๆ (dependencies, config, etc.)

#### 6. Push และ Create Pull Request

```bash
git push origin feature/amazing-feature
```

จากนั้น:
1. ไปที่ GitHub repo
2. คลิก "Compare & pull request"
3. กรอก PR description ให้ครบถ้วน:
   - **What**: อธิบายการเปลี่ยนแปลง
   - **Why**: เหตุผลที่ทำ
   - **How**: วิธีการที่ใช้
   - **Testing**: วิธีทดสอบ
   - **Screenshots**: ถ้ามี

## 🎨 Code Style

### Python

```python
# ✅ Good
def calculate_confidence(predictions: list[float]) -> float:
    """Calculate average confidence from predictions."""
    if not predictions:
        return 0.0
    return sum(predictions) / len(predictions)

# ❌ Bad
def calc(p):
    return sum(p)/len(p) if p else 0
```

### TypeScript

```typescript
// ✅ Good
interface UserData {
  userId: string;
  username: string;
  studentId: string;
}

const fetchUser = async (label: string): Promise<UserData | null> => {
  try {
    const response = await fetch(`/api/users/${label}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
};

// ❌ Bad
const fetchUser = async (l: any) => {
  return await fetch(`/api/users/${l}`).then(r => r.json());
};
```

## 📝 Documentation

เมื่อเพิ่ม feature ใหม่ ให้อัพเดท:
- [ ] README.md
- [ ] API Documentation (ถ้ามี endpoint ใหม่)
- [ ] TROUBLESHOOTING.md (ถ้ามีปัญหาที่อาจเกิด)
- [ ] Code comments
- [ ] Type definitions

## ✅ Review Process

1. CI/CD จะทำการ run tests อัตโนมัติ
2. Code review โดย maintainers
3. แก้ไขตาม feedback (ถ้ามี)
4. Merge เข้า main branch

## 🎯 Priority Features

Features ที่ต้องการความช่วยเหลือ:

- [ ] **Mobile Support**: Responsive design improvement
- [ ] **Performance**: Optimize model inference speed
- [ ] **Testing**: Add unit tests and integration tests
- [ ] **Documentation**: Add more code examples
- [ ] **Internationalization**: Multi-language support
- [ ] **Dark Mode**: Improve dark theme
- [ ] **Error Handling**: Better error messages
- [ ] **Logging**: Add more detailed logs

## 📞 ติดต่อ

มีคำถามหรือต้องการความช่วยเหลือ?

- **GitHub Issues**: [github.com/HumNoi1/Eye_Detection/issues](https://github.com/HumNoi1/Eye_Detection/issues)
- **Email**: (ใส่อีเมลของคุณ)

## 🙏 ขอบคุณ

ขอบคุณสำหรับ contribution ของคุณ! 🎉

---

<div align="center">

Made with ❤️ by the Eye Detection community

</div>
