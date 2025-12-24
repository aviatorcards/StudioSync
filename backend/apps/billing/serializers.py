from rest_framework import serializers
from .models import Invoice, InvoiceLineItem, Payment

class InvoiceLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceLineItem
        fields = ['id', 'description', 'quantity', 'unit_price', 'total_price', 'created_at']
        read_only_fields = ['total_price', 'created_at']

class InvoiceSerializer(serializers.ModelSerializer):
    line_items = InvoiceLineItemSerializer(many=True, required=False)
    balance_due = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    
    # Display fields
    student_name = serializers.SerializerMethodField()
    band_name = serializers.SerializerMethodField()
    
    def get_student_name(self, obj):
        if obj.student and obj.student.user:
            return obj.student.user.get_full_name()
        return ""

    def get_band_name(self, obj):
        return obj.band.name if obj.band else ""
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'status', 'issue_date', 'due_date', 
            'subtotal', 'tax_amount', 'discount_amount', 'total_amount', 
            'amount_paid', 'balance_due', 'is_overdue', 'line_items', 
            'created_at', 'notes',
            'band', 'student', 'teacher',
            'band_name', 'student_name'
        ]
        read_only_fields = [
            'invoice_number', 'subtotal', 'total_amount', 'amount_paid', 
            'balance_due', 'is_overdue', 'created_at'
        ]

    def create(self, validated_data):
        line_items_data = validated_data.pop('line_items', [])
        invoice = Invoice.objects.create(**validated_data)
        for item_data in line_items_data:
            InvoiceLineItem.objects.create(invoice=invoice, **item_data)
        invoice.calculate_totals()
        return invoice

    def update(self, instance, validated_data):
        line_items_data = validated_data.pop('line_items', [])
        # Update main fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # improving nested update is complex (match IDs etc).
        # For MVP, if line items are provided, replace them? Or just append?
        # Let's assume replacement for now if provided, or append.
        # Actually simpler to just ignore nested update for now unless user asks.
        # But create is strict requirement.
        
        if line_items_data:
            # Clear old items? Or just add new ones? 
            # Safe bet: delete old and re-create if it's a "draft" invoice edit
            if instance.status == 'draft':
                instance.line_items.all().delete()
                for item_data in line_items_data:
                    InvoiceLineItem.objects.create(invoice=instance, **item_data)
                instance.calculate_totals()
                
        return instance
