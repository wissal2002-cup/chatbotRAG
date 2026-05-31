<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'conversation_id',
        'document_id',
        'role',
        'content',
        'ai_model',
        'tokens_used',
    ];

    public function document()
    {
        return $this->belongsTo(Document::class);
    }

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }
}