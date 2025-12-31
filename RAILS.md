# StudioSync as a Ruby on Rails Project

## Executive Summary

This document explores how StudioSync (currently Django + Next.js) would translate to Ruby on Rails, with focus on API architecture, real-time features, and frontend integration. This is a learning/comparison exercise to understand architectural differences.

---

## 1. Overall Architecture Comparison

### Current Stack (Django)
```
Frontend: Next.js 14 (TypeScript/React)
    ↓ REST API
Backend: Django 5.0 + DRF
Database: PostgreSQL
Real-time: Django Channels + Redis
Tasks: Celery + Redis
Storage: MinIO/S3
```

### Rails Equivalent
```
Frontend: Next.js 14 (TypeScript/React) [unchanged]
    ↓ REST API
Backend: Rails 7.2 (API-only mode)
Database: PostgreSQL
Real-time: Action Cable + Redis
Tasks: Sidekiq + Redis
Storage: Active Storage + S3
```

**Key Philosophical Differences:**
- **Django**: Explicit is better than implicit (Python Zen), clear separation of apps
- **Rails**: Convention over configuration, "magic" through metaprogramming
- **Django**: Multiple small apps (auth, core, lessons, billing, etc.)
- **Rails**: Monolithic app with namespaced models and concerns

---

## 2. API Architecture Deep Dive

### Django REST Framework (Current)

**File Structure:**
```
backend/
├── apps/
│   ├── lessons/
│   │   ├── models.py           # All lesson models in one file
│   │   ├── serializers.py      # DRF serializers
│   │   ├── views.py            # ViewSets
│   │   ├── urls.py             # URL routing
│   │   └── permissions.py      # Custom permissions
│   └── billing/
│       ├── models.py
│       ├── serializers.py
│       └── views.py
└── config/
    └── urls.py                  # Main URL conf
```

**Example: Lesson API Endpoint (Django)**
```python
# apps/lessons/models.py
class Lesson(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    scheduled_at = models.DateTimeField()

# apps/lessons/serializers.py
class LessonSerializer(serializers.ModelSerializer):
    teacher = TeacherSerializer(read_only=True)
    student = StudentSerializer(read_only=True)

    class Meta:
        model = Lesson
        fields = ['id', 'teacher', 'student', 'status', 'scheduled_at']

# apps/lessons/views.py
class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        lesson = self.get_object()
        lesson.status = 'cancelled'
        lesson.save()
        return Response({'status': 'cancelled'})

# apps/lessons/urls.py
router = DefaultRouter()
router.register(r'', LessonViewSet)

# config/urls.py
urlpatterns = [
    path('api/lessons/', include('apps.lessons.urls')),
]
```

### Rails API Equivalent

**File Structure:**
```
app/
├── models/
│   ├── lesson.rb               # ActiveRecord model
│   ├── teacher.rb
│   └── student.rb
├── controllers/
│   └── api/
│       └── v1/
│           ├── lessons_controller.rb
│           └── billing_controller.rb
├── serializers/                # Using ActiveModel::Serializers or Blueprinter
│   └── lesson_serializer.rb
└── policies/                   # Using Pundit for authorization
    └── lesson_policy.rb

config/
└── routes.rb                   # All routing in one file
```

**Example: Lesson API Endpoint (Rails)**
```ruby
# app/models/lesson.rb
class Lesson < ApplicationRecord
  # Rails uses id (bigint) by default, but can use UUID
  belongs_to :teacher
  belongs_to :student

  enum status: { scheduled: 0, completed: 1, cancelled: 2, missed: 3 }

  validates :scheduled_at, presence: true
  validates :status, inclusion: { in: statuses.keys }

  # Scopes for common queries
  scope :upcoming, -> { where('scheduled_at > ?', Time.current).order(:scheduled_at) }
  scope :for_teacher, ->(teacher) { where(teacher: teacher) }

  # Business logic methods
  def cancel!(reason: nil)
    update!(status: :cancelled, cancellation_reason: reason)
    LessonCancelledNotificationJob.perform_later(id)
  end
end

# app/serializers/lesson_serializer.rb (using Blueprinter gem)
class LessonSerializer < Blueprinter::Base
  identifier :id

  fields :status, :scheduled_at, :duration_minutes

  association :teacher, blueprint: TeacherSerializer
  association :student, blueprint: StudentSerializer

  # Conditional fields based on context
  field :cancellation_reason, if: ->(lesson, _options) { lesson.cancelled? }
end

# app/controllers/api/v1/lessons_controller.rb
class Api::V1::LessonsController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :set_lesson, only: [:show, :update, :destroy, :cancel]

  # GET /api/v1/lessons
  def index
    lessons = policy_scope(Lesson)
                .includes(:teacher, :student)
                .page(params[:page])
                .per(params[:per_page] || 25)

    render json: LessonSerializer.render(lessons, root: :lessons, meta: pagination_meta(lessons))
  end

  # GET /api/v1/lessons/:id
  def show
    authorize @lesson
    render json: LessonSerializer.render(@lesson)
  end

  # POST /api/v1/lessons
  def create
    lesson = Lesson.new(lesson_params)
    authorize lesson

    if lesson.save
      LessonScheduledNotificationJob.perform_later(lesson.id)
      render json: LessonSerializer.render(lesson), status: :created
    else
      render json: { errors: lesson.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # POST /api/v1/lessons/:id/cancel
  def cancel
    authorize @lesson

    @lesson.cancel!(reason: params[:reason])
    render json: LessonSerializer.render(@lesson)
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
  end

  private

  def set_lesson
    @lesson = Lesson.find(params[:id])
  end

  def lesson_params
    params.require(:lesson).permit(:teacher_id, :student_id, :scheduled_at, :duration_minutes)
  end
end

# app/policies/lesson_policy.rb (using Pundit)
class LessonPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      case user.role
      when 'admin'
        scope.all
      when 'teacher'
        scope.where(teacher: user.teacher)
      when 'student'
        scope.where(student: user.student)
      when 'parent'
        scope.where(student: user.family.students)
      end
    end
  end

  def cancel?
    user.admin? || record.teacher.user == user
  end
end

# config/routes.rb
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :lessons do
        member do
          post :cancel
        end
      end
      resources :students
      resources :teachers
      resources :invoices
      # ... other resources
    end
  end
end
```

### API Architecture Comparison

| Aspect | Django REST Framework | Rails API |
|--------|----------------------|-----------|
| **Routing** | Per-app `urls.py` files, explicit router registration | Central `routes.rb`, RESTful by default |
| **Serialization** | DRF Serializers (class-based, similar to forms) | Multiple options: AMS, Blueprinter, Jbuilder, JSONAPI-RB |
| **Validation** | In serializers + model clean() methods | In model validations + strong parameters |
| **Authorization** | DRF permissions (function/class-based) | Pundit (policy classes) or CanCanCan |
| **Pagination** | Built into DRF | Kaminari or Pagy gems |
| **Filtering** | django-filter package | Ransack gem or custom scopes |
| **API Versioning** | Namespace in URLs or custom routing | URL namespace (standard) |
| **Error Handling** | Exception handlers in DRF settings | Rescue_from in controllers |

**Key Differences:**

1. **Model-Serializer Coupling:**
   - **Django**: Serializers are independent classes, can mix fields from multiple models
   - **Rails**: Serializers typically mirror model structure, use view models for complex data

2. **URL Routing:**
   - **Django**: Explicit URL patterns, can be spread across apps
   - **Rails**: Resourceful routing by convention, all routes visible in one file

3. **Query Optimization:**
   - **Django**: `select_related()` and `prefetch_related()`
   - **Rails**: `includes()` (eager loading), `joins()` (SQL joins)

4. **Custom Actions:**
   - **Django**: `@action` decorator on ViewSets
   - **Rails**: Custom routes with `member` or `collection` blocks

---

## 3. Real-Time Features Comparison

### Django Channels (Current)

**Architecture:**
```
Client WebSocket
    ↓
Django Channels (ASGI)
    ↓
Channel Layers (Redis)
    ↓
Consumer (async/sync)
```

**Example: Messaging Consumer**
```python
# apps/messaging/consumers.py
class MessagingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = await self.save_message(data)

        # Broadcast to room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message']
        }))

# config/routing.py
websocket_urlpatterns = [
    path('ws/messaging/<room_name>/', MessagingConsumer.as_asgi()),
]
```

**Deployment:**
- Requires ASGI server (Daphne, Uvicorn)
- Separate from WSGI app (can run both)
- Redis as channel layer backend

### Action Cable (Rails)

**Architecture:**
```
Client WebSocket
    ↓
Action Cable (built into Rails)
    ↓
Redis (pub/sub)
    ↓
Channel (Ruby class)
```

**Example: Messaging Channel**
```ruby
# app/channels/messaging_channel.rb
class MessagingChannel < ApplicationCable::Channel
  def subscribed
    thread = MessageThread.find(params[:thread_id])
    stream_for thread
  end

  def unsubscribed
    # Cleanup when channel is closed
  end

  def receive(data)
    thread = MessageThread.find(params[:thread_id])
    message = thread.messages.create!(
      user: current_user,
      content: data['message']
    )

    # Broadcast to all subscribers
    MessagingChannel.broadcast_to(
      thread,
      message: MessageSerializer.render_as_hash(message)
    )
  end
end

# app/channels/application_cable/connection.rb
module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      # Extract JWT from query params or cookies
      token = request.params[:token] || cookies.encrypted[:token]
      decoded = JWT.decode(token, Rails.application.credentials.secret_key_base)[0]
      User.find(decoded['user_id'])
    rescue
      reject_unauthorized_connection
    end
  end
end

# Broadcasting from anywhere in the app
class Message < ApplicationRecord
  after_create_commit do
    MessagingChannel.broadcast_to(
      thread,
      message: MessageSerializer.render_as_hash(self)
    )
  end
end
```

**Frontend Connection (same for both):**
```typescript
// services/websocket.ts
class WebSocketService {
  private cable: ActionCable.Cable

  connect(token: string) {
    this.cable = ActionCable.createConsumer(
      `ws://localhost:3000/cable?token=${token}`
    )
  }

  subscribeToThread(threadId: string, onReceive: (data: any) => void) {
    this.cable.subscriptions.create(
      { channel: 'MessagingChannel', thread_id: threadId },
      {
        received: onReceive,
        connected: () => console.log('Connected'),
        disconnected: () => console.log('Disconnected')
      }
    )
  }
}
```

### Real-Time Feature Comparison

| Aspect | Django Channels | Action Cable |
|--------|-----------------|--------------|
| **Integration** | Third-party package, ASGI server | Built into Rails 5+ |
| **Architecture** | Consumer classes (async/sync) | Channel classes (thread-based) |
| **Authentication** | Manual in `connect()` method | ConnectionBase with `identified_by` |
| **Broadcasting** | `channel_layer.group_send()` | `ChannelName.broadcast_to()` |
| **Backend** | Redis Channel Layer | Redis pub/sub (default) |
| **Performance** | Async-native (better for I/O) | Thread-based (good for CPU) |
| **Deployment** | Separate ASGI process | Same as Rails app (can scale separately) |
| **Testing** | `ChannelsLiveServerTestCase` | Built-in Action Cable test helpers |

**Key Differences:**

1. **Async vs Threaded:**
   - **Channels**: True async with Python async/await, better for thousands of connections
   - **Cable**: Thread-per-connection (can use fibers), simpler mental model

2. **Integration:**
   - **Channels**: Requires separate ASGI server (Daphne), more setup
   - **Cable**: Works out of the box with Puma (threaded) or Falcon (async)

3. **Broadcasting Patterns:**
   - **Channels**: Group-based, manual group management
   - **Cable**: Stream-based, automatically handles subscriptions

4. **Authentication:**
   - **Channels**: Store user in `scope`, manual JWT verification
   - **Cable**: `identified_by` pattern, cleaner separation

**Rails Advantage for StudioSync:**
- Action Cable is simpler to set up and deploy
- Better integrated with ActiveJob for async tasks
- Can broadcast from model callbacks (`after_commit`)
- Single server process handles both HTTP and WebSocket

**Django Channels Advantage:**
- Better performance at massive scale (10k+ concurrent connections)
- True async throughout stack
- More flexible consumer patterns

---

## 4. Frontend Integration

### Current Integration (Django + Next.js)

```typescript
// services/api.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Attempt token refresh
      const refreshToken = localStorage.getItem('refresh_token')
      const response = await axios.post('/api/auth/token/refresh/', {
        refresh: refreshToken
      })
      localStorage.setItem('access_token', response.data.access)
      // Retry original request
      return api.request(error.config)
    }
    return Promise.reject(error)
  }
)
```

### Rails Integration Options

**Option 1: Keep Same Pattern (Recommended for StudioSync)**
- Next.js remains standalone frontend
- Rails API-only mode (`rails new --api`)
- JWT authentication (jwt gem)
- CORS configuration (rack-cors gem)
- **No changes to frontend code**

**Rails API Setup:**
```ruby
# Gemfile
gem 'rack-cors'
gem 'jwt'
gem 'bcrypt'

# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'http://localhost:3000'
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options],
      credentials: true
  end
end

# app/controllers/api/v1/auth_controller.rb
class Api::V1::AuthController < ApplicationController
  skip_before_action :authenticate_user!, only: [:login]

  def login
    user = User.find_by(email: params[:email])

    if user&.authenticate(params[:password])
      token = JWT.encode(
        { user_id: user.id, exp: 24.hours.from_now.to_i },
        Rails.application.credentials.secret_key_base
      )
      render json: {
        access_token: token,
        user: UserSerializer.render_as_hash(user)
      }
    else
      render json: { error: 'Invalid credentials' }, status: :unauthorized
    end
  end
end
```

**Option 2: Rails with Hotwire (Alternative Full-Stack Approach)**
- Replace Next.js with Rails views + Hotwire (Turbo + Stimulus)
- Server-rendered HTML with reactive updates
- Less JavaScript, more Ruby
- **Significant frontend rewrite required**

**Hotwire Example:**
```erb
<!-- app/views/lessons/index.html.erb -->
<div data-controller="lessons">
  <%= turbo_frame_tag "lessons" do %>
    <% @lessons.each do |lesson| %>
      <%= render lesson %>
    <% end %>
  <% end %>
</div>

<!-- app/views/lessons/_lesson.html.erb -->
<%= turbo_frame_tag dom_id(lesson) do %>
  <div class="lesson-card">
    <h3><%= lesson.student.name %></h3>
    <p><%= lesson.scheduled_at.strftime('%B %d, %Y at %I:%M %p') %></p>
    <%= button_to "Cancel", cancel_lesson_path(lesson),
        method: :post,
        data: { turbo_method: :post } %>
  </div>
<% end %>

# Broadcasts automatically update the view
class Lesson < ApplicationRecord
  after_update_commit { broadcast_replace_to "lessons" }
end
```

### Frontend Integration Comparison

| Aspect | Current (Django + Next.js) | Rails API + Next.js | Rails + Hotwire |
|--------|---------------------------|---------------------|-----------------|
| **Frontend Framework** | Next.js/React | Next.js/React (unchanged) | Rails Views + Stimulus |
| **Data Fetching** | REST API calls | REST API calls (unchanged) | Turbo Frames |
| **Real-time Updates** | WebSocket + React state | Action Cable + React state | Turbo Streams (built-in) |
| **Deployment** | Separate frontend/backend | Separate frontend/backend | Single Rails app |
| **SEO** | Next.js SSR | Next.js SSR | Rails SSR |
| **Developer Experience** | Two codebases | Two codebases | One codebase |
| **TypeScript** | Yes | Yes | Optional (via JS) |
| **Bundle Size** | ~200KB JS | ~200KB JS | ~50KB JS |

**Recommendation for StudioSync:**
- **Keep Next.js + Rails API** (Option 1)
  - Minimal frontend changes
  - Leverages existing Next.js investment
  - Modern developer experience
  - Better for future mobile app (shared API)

**When Hotwire Makes Sense:**
- Starting from scratch
- Prefer server-rendered UIs
- Small team with Ruby expertise
- Want faster time-to-market

---

## 5. Background Jobs & Async Tasks

### Current: Celery (Django)

```python
# apps/notifications/tasks.py
from celery import shared_task

@shared_task
def send_lesson_reminder(lesson_id):
    lesson = Lesson.objects.get(id=lesson_id)
    send_email(
        to=lesson.student.email,
        subject=f'Lesson Reminder: {lesson.scheduled_at}',
        template='lesson_reminder',
        context={'lesson': lesson}
    )

    if lesson.student.phone_number:
        send_sms(
            to=lesson.student.phone_number,
            message=f'Reminder: Lesson with {lesson.teacher.name} at {lesson.scheduled_at}'
        )

# Schedule the task
send_lesson_reminder.apply_async(
    args=[lesson.id],
    eta=lesson.scheduled_at - timedelta(hours=1)
)
```

### Rails: Sidekiq

```ruby
# app/jobs/lesson_reminder_job.rb
class LessonReminderJob < ApplicationJob
  queue_as :default

  def perform(lesson_id)
    lesson = Lesson.find(lesson_id)

    LessonReminderMailer.with(lesson: lesson).reminder_email.deliver_now

    if lesson.student.phone_number.present?
      TwilioService.send_sms(
        to: lesson.student.phone_number,
        body: "Reminder: Lesson with #{lesson.teacher.name} at #{lesson.scheduled_at.strftime('%I:%M %p')}"
      )
    end
  end
end

# Schedule the job
LessonReminderJob.set(wait_until: lesson.scheduled_at - 1.hour).perform_later(lesson.id)
```

### Background Jobs Comparison

| Aspect | Celery | Sidekiq |
|--------|--------|---------|
| **Language** | Python | Ruby |
| **Backend** | Redis, RabbitMQ, SQS | Redis only |
| **Performance** | Multi-process (prefork) | Multi-threaded |
| **Concurrency** | ~4-8 workers per process | ~25 threads per process |
| **Reliability** | Good, requires config | Excellent out of box |
| **Monitoring UI** | Flower (separate tool) | Built-in web UI |
| **Scheduled Tasks** | Celery Beat | Sidekiq-Cron or Sidekiq-Scheduler |
| **Rails Integration** | N/A | Native (ActiveJob) |

**Rails Advantage:**
- ActiveJob abstraction (can swap Sidekiq for Resque, DelayedJob, etc.)
- Simpler configuration
- Better Rails integration (mailers, ActiveStorage, etc.)

---

## 6. Database & Models

### Model Definition Comparison

**Django:**
```python
class Student(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    family = models.ForeignKey(Family, on_delete=models.SET_NULL, null=True)
    instrument = models.CharField(max_length=100)
    skill_level = models.CharField(max_length=20, choices=SKILL_LEVELS)
    enrollment_date = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'students'
        ordering = ['user__last_name', 'user__first_name']

    def __str__(self):
        return self.user.get_full_name()

    def get_absolute_url(self):
        return reverse('student-detail', args=[self.id])
```

**Rails:**
```ruby
class Student < ApplicationRecord
  # id is auto-generated primary key (bigint or uuid if configured)

  belongs_to :user
  belongs_to :family, optional: true
  has_many :lessons, dependent: :destroy
  has_many :teachers, through: :lessons

  enum skill_level: { beginner: 0, intermediate: 1, advanced: 2, expert: 3 }

  validates :instrument, presence: true, length: { maximum: 100 }
  validates :skill_level, inclusion: { in: skill_levels.keys }

  scope :active, -> { where(is_active: true) }
  scope :by_name, -> { joins(:user).order('users.last_name', 'users.first_name') }

  def full_name
    user.full_name
  end

  # Rails automatically creates: created_at, updated_at
end
```

### Migration Comparison

**Django:**
```python
class Migration(migrations.Migration):
    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Student',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4)),
                ('instrument', models.CharField(max_length=100)),
                ('skill_level', models.CharField(max_length=20)),
                ('is_active', models.BooleanField(default=True)),
                ('user', models.OneToOneField(to='auth.User', on_delete=models.CASCADE)),
            ],
        ),
    ]
```

**Rails:**
```ruby
class CreateStudents < ActiveRecord::Migration[7.2]
  def change
    create_table :students, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.references :family, foreign_key: true, type: :uuid
      t.string :instrument, limit: 100, null: false
      t.integer :skill_level, default: 0, null: false
      t.boolean :is_active, default: true, null: false

      t.timestamps  # Automatically creates created_at, updated_at
    end

    add_index :students, :instrument
    add_index :students, :is_active
  end
end
```

### ORM Comparison

| Operation | Django ORM | ActiveRecord |
|-----------|-----------|--------------|
| **Create** | `Student.objects.create(...)` | `Student.create(...)` |
| **Find by ID** | `Student.objects.get(id=1)` | `Student.find(1)` |
| **Filter** | `Student.objects.filter(is_active=True)` | `Student.where(is_active: true)` |
| **Join** | `Student.objects.select_related('user')` | `Student.includes(:user)` |
| **Aggregation** | `Student.objects.count()` | `Student.count` |
| **Update** | `student.save()` | `student.save` |
| **Delete** | `student.delete()` | `student.destroy` |
| **Callbacks** | `def save(self, *args, **kwargs)` | `after_save :method_name` |

**Key Differences:**
1. **Query Interface:** Django uses `objects.` manager, Rails uses class methods directly
2. **Callbacks:** Rails has explicit callback hooks, Django overrides methods
3. **Validations:** Both similar, but Rails more declarative
4. **Associations:** Rails `has_many`/`belongs_to` vs Django ForeignKey with reverse relations

---

## 7. Authentication & Authorization

### JWT Authentication

**Django (current):**
```python
# Uses djangorestframework-simplejwt
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

# apps/auth/views.py
from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
```

**Rails:**
```ruby
# Gemfile
gem 'jwt'
gem 'bcrypt'

# app/controllers/concerns/authenticable.rb
module Authenticable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!
  end

  def authenticate_user!
    token = request.headers['Authorization']&.split(' ')&.last
    decoded = JWT.decode(token, Rails.application.credentials.secret_key_base)[0]
    @current_user = User.find(decoded['user_id'])
  rescue JWT::DecodeError, ActiveRecord::RecordNotFound
    render json: { error: 'Unauthorized' }, status: :unauthorized
  end

  def current_user
    @current_user
  end
end
```

### Alternative: Devise + Devise-JWT (Rails)

```ruby
# Gemfile
gem 'devise'
gem 'devise-jwt'

# app/models/user.rb
class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :jwt_authenticatable, jwt_revocation_strategy: JwtDenylist
end

# Automatically handles:
# - User registration
# - Password reset
# - Email confirmation
# - Token generation/revocation
# - Remember me
```

**Authorization: Pundit (Rails) vs DRF Permissions**

Both similar in approach:
- Policy/Permission classes define rules
- Checked in controllers/views
- Scope queries based on user

---

## 8. File Storage

### Django: django-storages + boto3

```python
# settings.py
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
AWS_STORAGE_BUCKET_NAME = 'studiosync-files'

# Usage
class Resource(models.Model):
    file = models.FileField(upload_to='resources/')
```

### Rails: Active Storage

```ruby
# app/models/resource.rb
class Resource < ApplicationRecord
  has_one_attached :file
  has_one_attached :thumbnail
  has_many_attached :images
end

# Usage
resource.file.attach(io: File.open('/path/to/file'), filename: 'document.pdf')
resource.file.url  # Generates signed URL
resource.file.download  # Download file

# config/storage.yml
amazon:
  service: S3
  access_key_id: <%= ENV['AWS_ACCESS_KEY_ID'] %>
  secret_access_key: <%= ENV['AWS_SECRET_ACCESS_KEY'] %>
  region: us-east-1
  bucket: studiosync-files
```

**Active Storage Advantages:**
- Built into Rails
- Direct uploads to S3 from browser
- Image variants (resize, crop) with ImageMagick/libvips
- Virus scanning integration
- Mirror service (multiple storage backends)

---

## 9. Testing

### Test Framework Comparison

**Django:**
```python
from django.test import TestCase
from rest_framework.test import APIClient

class LessonAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user('test@example.com', 'password')
        self.client.force_authenticate(user=self.user)

    def test_create_lesson(self):
        response = self.client.post('/api/lessons/', {
            'teacher_id': self.teacher.id,
            'student_id': self.student.id,
            'scheduled_at': '2025-01-15T10:00:00Z'
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Lesson.objects.count(), 1)
```

**Rails:**
```ruby
require 'rails_helper'

RSpec.describe 'Lessons API', type: :request do
  let(:user) { create(:user) }
  let(:token) { JWT.encode({ user_id: user.id }, Rails.application.credentials.secret_key_base) }
  let(:headers) { { 'Authorization' => "Bearer #{token}" } }

  describe 'POST /api/v1/lessons' do
    it 'creates a new lesson' do
      post '/api/v1/lessons',
        params: { lesson: { teacher_id: teacher.id, student_id: student.id } },
        headers: headers

      expect(response).to have_http_status(:created)
      expect(Lesson.count).to eq(1)
    end
  end
end
```

**Testing Ecosystem:**

| Aspect | Django | Rails |
|--------|--------|-------|
| **Unit Tests** | unittest (built-in) | RSpec or Minitest |
| **Factories** | Factory Boy | FactoryBot |
| **Fixtures** | Django fixtures | Rails fixtures or factories |
| **Mocking** | unittest.mock | RSpec mocks or Mocha |
| **Coverage** | coverage.py | SimpleCov |
| **Test Runner** | pytest-django | RSpec |

---

## 10. Development Experience

### Project Structure

**Django (current):**
```
backend/
├── manage.py                    # CLI entry point
├── config/                      # Project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── apps/                        # Feature modules
    ├── auth/
    ├── core/
    ├── lessons/
    └── billing/
```

**Rails:**
```
app/                             # Application code
├── models/
├── controllers/
├── views/                       # (empty for API-only)
├── jobs/
├── mailers/
├── channels/
└── serializers/
config/                          # Configuration
├── routes.rb
├── database.yml
├── credentials.yml.enc
└── environments/
db/
├── migrate/
├── schema.rb
└── seeds.rb
```

### Common Commands

| Task | Django | Rails |
|------|--------|-------|
| **Start Server** | `python manage.py runserver` | `rails server` |
| **Console** | `python manage.py shell` | `rails console` |
| **Migrations** | `python manage.py makemigrations` | `rails generate migration` |
| **Run Migrations** | `python manage.py migrate` | `rails db:migrate` |
| **Create Model** | Manual or `manage.py startapp` | `rails generate model` |
| **Routes** | `python manage.py show_urls` | `rails routes` |
| **Tests** | `python manage.py test` | `rails test` or `rspec` |
| **Seed DB** | `python manage.py loaddata` | `rails db:seed` |

### Code Generation

**Rails has more generators:**
```bash
rails generate scaffold Student name:string instrument:string
# Creates: model, migration, controller, serializer, tests, routes

rails generate controller Api::V1::Lessons index show create
# Creates: controller with actions, routes, tests

rails generate job SendLessonReminder
# Creates: job class with tests
```

Django requires more manual work but gives more control.

---

## 11. Deployment Considerations

### Container Setup

**Django (current):**
```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "config.wsgi:application"]
```

**Rails:**
```dockerfile
FROM ruby:3.3
WORKDIR /app
COPY Gemfile Gemfile.lock .
RUN bundle install
COPY . .
CMD ["rails", "server", "-b", "0.0.0.0"]
```

**Production Stack:**

| Component | Django | Rails |
|-----------|--------|-------|
| **App Server** | Gunicorn + Uvicorn (ASGI) | Puma (threaded) or Falcon (async) |
| **Web Server** | Nginx | Nginx |
| **Process Manager** | Systemd or Supervisor | Systemd or Capistrano |
| **Assets** | WhiteNoise or CDN | Propshaft or CDN |
| **Monitoring** | Sentry + Prometheus | Sentry + Prometheus |

---

## 12. Gem/Package Ecosystem

### Common StudioSync Dependencies

| Feature | Django Package | Rails Gem |
|---------|---------------|-----------|
| **API Framework** | djangorestframework | rails (built-in) |
| **Authentication** | djangorestframework-simplejwt | devise or jwt |
| **Authorization** | django-guardian | pundit or cancancan |
| **CORS** | django-cors-headers | rack-cors |
| **File Storage** | django-storages | activestorage (built-in) |
| **Background Jobs** | celery | sidekiq |
| **Payments** | stripe-python | stripe |
| **Email** | sendgrid-django | sendgrid-ruby |
| **Admin UI** | django-jazzmin | activeadmin or administrate |
| **Search** | django-haystack + elasticsearch | elasticsearch-rails |
| **Pagination** | (built into DRF) | kaminari or pagy |
| **Serialization** | (DRF serializers) | blueprinter or jbuilder |
| **Websockets** | channels | action_cable (built-in) |
| **Testing** | pytest-django | rspec-rails |

**Ecosystem Maturity:**
- **Django**: Mature, stable, fewer breaking changes
- **Rails**: Very mature, conventions well-established, frequent updates

---

## 13. Learning Curve & Developer Productivity

### For StudioSync Specifically

**Django + DRF Advantages:**
- ✅ More explicit code (easier to understand)
- ✅ Better for Python developers
- ✅ Excellent admin interface out of box
- ✅ More flexible app structure
- ✅ Async support more modern (ASGI)

**Rails Advantages:**
- ✅ Faster initial development (generators)
- ✅ More built-in features (Action Cable, Active Storage, ActionMailer)
- ✅ Single-server deployment (no separate ASGI)
- ✅ Better conventions (less decision fatigue)
- ✅ Simpler WebSocket setup
- ✅ Stronger metaprogramming (more "magic" but less code)

**Time to Implement StudioSync in Rails:**
- **Models & Migrations**: ~same time (both have good tools)
- **API Endpoints**: Rails ~20% faster (conventions + generators)
- **Real-time Features**: Rails ~40% faster (Action Cable simpler)
- **Authentication**: Rails ~30% faster (Devise is comprehensive)
- **Background Jobs**: Rails ~20% faster (ActiveJob integration)
- **File Uploads**: Rails ~50% faster (Active Storage built-in)
- **Testing**: ~same time (both have good testing tools)

**Overall: Rails would save ~25-30% development time for StudioSync**

---

## 14. Critical Files for Conversion

If actually converting StudioSync to Rails, these would be the key files to rewrite:

### High Priority (Core Architecture)
1. **Models** (apps/core/models.py) → app/models/*.rb
2. **Serializers** (apps/*/serializers.py) → app/serializers/*.rb
3. **Controllers** (apps/*/views.py) → app/controllers/api/v1/*.rb
4. **Routes** (config/urls.py, apps/*/urls.py) → config/routes.rb
5. **Authentication** (apps/auth/) → app/controllers/concerns/authenticable.rb + Devise setup
6. **WebSockets** (apps/messaging/consumers.py) → app/channels/*.rb
7. **Background Jobs** (apps/*/tasks.py) → app/jobs/*.rb

### Medium Priority (Features)
8. **Permissions** (apps/*/permissions.py) → app/policies/*.rb (Pundit)
9. **Migrations** (apps/*/migrations/) → db/migrate/*.rb
10. **Mailers** (email templates) → app/mailers/*.rb + views
11. **Settings** (config/settings.py) → config/*.yml + config/initializers/

### Low Priority (Nice to Have)
12. **Admin** (keep Django admin or rebuild with ActiveAdmin)
13. **Tests** (rewrite with RSpec)
14. **Seed Data** (scripts/) → db/seeds.rb

**Frontend: NO CHANGES REQUIRED** (Next.js stays the same)

---

## 15. Summary & Recommendations

### When to Choose Rails for StudioSync

**Choose Rails if:**
- ✅ Team has Ruby expertise
- ✅ Want faster development (especially for MVP)
- ✅ Prefer conventions over configuration
- ✅ Want simpler WebSocket setup
- ✅ Like built-in features (Active Storage, Action Mailer, Action Cable)
- ✅ Want single deployment process
- ✅ Appreciate "magic" that saves time

### When to Keep Django for StudioSync

**Keep Django if:**
- ✅ Team has Python expertise
- ✅ Need explicit, readable code
- ✅ Want flexibility in app structure
- ✅ Plan to use Django admin heavily
- ✅ Prefer async/await architecture
- ✅ Need scientific/ML libraries (Python ecosystem)
- ✅ Like separation of concerns (apps)

### For This Specific Project (Learning Exercise)

**Key Architectural Insights:**

1. **API Structure**: Rails would use resourceful routing with namespaced controllers, slightly cleaner than Django's app-based URL routing

2. **Real-time**: Action Cable would simplify WebSocket implementation significantly vs Django Channels

3. **Background Jobs**: Sidekiq + ActiveJob would integrate better than Celery (fewer moving parts)

4. **File Storage**: Active Storage is superior to django-storages (more features, better integration)

5. **Authentication**: Devise would save time vs manual JWT setup, but adds "magic"

6. **Frontend**: **No changes needed** - Next.js works identically with both backends

### Estimated Conversion Effort

For a full Django → Rails conversion:
- **Models & DB**: 2-3 weeks
- **API Endpoints**: 3-4 weeks
- **Real-time Features**: 1-2 weeks
- **Authentication**: 1 week
- **Background Jobs**: 1 week
- **Testing**: 2-3 weeks
- **Deployment Setup**: 1 week

**Total: ~10-14 weeks for experienced Rails developer**

---

## Conclusion

StudioSync as a Rails project would be **architecturally similar but syntactically different**. The same business logic, similar patterns, but Rails conventions would lead to:

- **Less boilerplate** (generators, built-in features)
- **Simpler deployment** (single process for HTTP + WebSockets)
- **Faster initial development** (conventions save decision time)
- **More "magic"** (metaprogramming, implicit behavior)

The Next.js frontend would remain **completely unchanged**, demonstrating the power of API-first architecture.

For a **learning exercise**, the key takeaway is understanding how two mature frameworks approach the same problems with different philosophies:
- **Django**: Explicit, flexible, modular
- **Rails**: Conventional, integrated, opinionated

Both are excellent choices for StudioSync. The decision comes down to team expertise and preferences rather than technical limitations.
